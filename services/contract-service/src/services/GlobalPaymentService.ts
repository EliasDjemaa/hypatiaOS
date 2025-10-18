import { DatabaseManager } from '../database/DatabaseManager';
import { KafkaManager } from '../events/KafkaManager';
import { logger } from '../utils/logger';
import Decimal from 'decimal.js';

export interface GlobalPaymentConfig {
  currency: string;
  exchangeRate: number;
  vatRate?: number;
  localTaxRules?: any;
  paymentMethods: string[];
  bankingDetails?: any;
  regulatoryRequirements?: string[];
}

export interface SitePaymentSetup {
  siteId: string;
  paymentType: 'visit_based' | 'procedure_based' | 'milestone_based';
  splitPayees?: {
    payeeId: string;
    percentage: number;
    bankDetails: any;
  }[];
  localCurrency: string;
  vatHandling: 'inclusive' | 'exclusive' | 'exempt';
  invoiceSubmissionMethod: 'electronic' | 'portal' | 'email';
}

export interface ForecastScenario {
  scenarioName: string;
  studyAssumptions: {
    screenFailRate: number;
    dropoutRate: number;
    enrollmentRate: number;
    siteActivationRate: number;
    holdbackPercentage: number;
  };
  visitFlow: {
    visitId: string;
    expectedDuration: number;
    procedureCount: number;
    costPerVisit: number;
  }[];
  milestones: {
    milestoneId: string;
    probability: number;
    expectedDate: Date;
    paymentAmount: number;
  }[];
}

export class GlobalPaymentService {

  /**
   * Setup global payment configuration for multi-country studies
   */
  static async setupGlobalPaymentConfig(
    studyId: string, 
    countryConfigs: { [countryCode: string]: GlobalPaymentConfig },
    user: any
  ) {
    const client = await DatabaseManager.getClient();
    
    try {
      await client.query('BEGIN');

      // Store global payment configuration
      for (const [countryCode, config] of Object.entries(countryConfigs)) {
        await client.query(`
          INSERT INTO global_payment_configs (
            study_id, country_code, currency, exchange_rate, vat_rate,
            payment_methods, banking_details, regulatory_requirements,
            created_by, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
          ON CONFLICT (study_id, country_code) 
          DO UPDATE SET
            currency = $3, exchange_rate = $4, vat_rate = $5,
            payment_methods = $6, banking_details = $7,
            regulatory_requirements = $8, updated_at = NOW()
        `, [
          studyId, countryCode, config.currency, config.exchangeRate,
          config.vatRate, JSON.stringify(config.paymentMethods),
          JSON.stringify(config.bankingDetails),
          JSON.stringify(config.regulatoryRequirements), user.id
        ]);
      }

      await client.query('COMMIT');
      
      logger.info(`Global payment config setup for study ${studyId}`);
      
      return { success: true, studyId, countriesConfigured: Object.keys(countryConfigs).length };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Setup flexible site payment configurations
   */
  static async setupSitePayments(
    studyId: string,
    siteConfigs: { [siteId: string]: SitePaymentSetup },
    user: any
  ) {
    const client = await DatabaseManager.getClient();
    
    try {
      await client.query('BEGIN');

      for (const [siteId, config] of Object.entries(siteConfigs)) {
        // Create site payment configuration
        await client.query(`
          INSERT INTO site_payment_configs (
            study_id, site_id, payment_type, split_payees, local_currency,
            vat_handling, invoice_submission_method, created_by, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
          ON CONFLICT (study_id, site_id)
          DO UPDATE SET
            payment_type = $3, split_payees = $4, local_currency = $5,
            vat_handling = $6, invoice_submission_method = $7, updated_at = NOW()
        `, [
          studyId, siteId, config.paymentType,
          JSON.stringify(config.splitPayees), config.localCurrency,
          config.vatHandling, config.invoiceSubmissionMethod, user.id
        ]);

        // Setup automatic EDC-driven payment triggers
        if (config.paymentType === 'visit_based') {
          await this.setupVisitBasedPayments(studyId, siteId, client);
        } else if (config.paymentType === 'procedure_based') {
          await this.setupProcedureBasedPayments(studyId, siteId, client);
        }
      }

      await client.query('COMMIT');
      
      // Publish configuration event
      await KafkaManager.publishEvent('site_payments.configured', {
        studyId,
        sitesConfigured: Object.keys(siteConfigs),
        timestamp: new Date().toISOString()
      });

      return { success: true, sitesConfigured: Object.keys(siteConfigs).length };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Advanced forecasting with scenario modeling
   */
  static async generateAdvancedForecast(
    studyId: string,
    scenarios: ForecastScenario[],
    forecastPeriodMonths: number,
    user: any
  ) {
    // Get study budget templates and line items
    const budgetData = await DatabaseManager.query(`
      SELECT b.*, bli.* 
      FROM budgets b
      JOIN budget_line_items bli ON b.id = bli.budget_id
      WHERE b.study_id = $1 AND b.status = 'approved'
    `, [studyId]);

    const forecasts = [];

    for (const scenario of scenarios) {
      const forecast = await this.calculateScenarioForecast(
        studyId,
        scenario,
        budgetData.rows,
        forecastPeriodMonths
      );
      
      forecasts.push({
        scenarioName: scenario.scenarioName,
        forecast,
        assumptions: scenario.studyAssumptions,
        totalProjectedCost: forecast.reduce((sum: number, month: any) => sum + month.totalCost, 0),
        totalProjectedEnrollment: forecast.reduce((sum: number, month: any) => sum + month.enrolledParticipants, 0)
      });
    }

    // Store forecast results
    await DatabaseManager.query(`
      INSERT INTO forecast_results (
        study_id, forecast_type, scenarios, results, created_by, created_at
      ) VALUES ($1, 'advanced_scenario', $2, $3, $4, NOW())
    `, [studyId, JSON.stringify(scenarios), JSON.stringify(forecasts), user.id]);

    return {
      studyId,
      forecastPeriodMonths,
      scenarios: forecasts,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Process EDC-driven automatic payments
   */
  static async processEDCDrivenPayment(
    visitId: string,
    completedProcedures: string[],
    user: any
  ) {
    // Get visit and site payment configuration
    const visitData = await DatabaseManager.query(`
      SELECT v.*, s.id as site_id, st.id as study_id, spc.payment_type, spc.local_currency
      FROM visits v
      JOIN participants p ON v.participant_id = p.id
      JOIN sites s ON p.site_id = s.id
      JOIN studies st ON p.study_id = st.id
      JOIN site_payment_configs spc ON spc.study_id = st.id AND spc.site_id = s.id
      WHERE v.id = $1
    `, [visitId]);

    if (visitData.rows.length === 0) {
      throw new Error('Visit or payment configuration not found');
    }

    const visit = visitData.rows[0];
    
    // Calculate payment based on configuration
    let paymentAmount = 0;
    
    if (visit.payment_type === 'visit_based') {
      // Fixed payment per visit
      const visitRate = await this.getVisitRate(visit.study_id, visit.site_id, visit.visit_type);
      paymentAmount = visitRate;
    } else if (visit.payment_type === 'procedure_based') {
      // Payment based on completed procedures
      paymentAmount = await this.calculateProcedureBasedPayment(
        visit.study_id, 
        visit.site_id, 
        completedProcedures
      );
    }

    // Handle currency conversion if needed
    if (visit.local_currency !== 'USD') {
      const exchangeRate = await this.getExchangeRate('USD', visit.local_currency);
      paymentAmount = new Decimal(paymentAmount).mul(exchangeRate).toNumber();
    }

    // Create payment record
    const paymentId = await this.createPaymentRecord({
      visitId,
      siteId: visit.site_id,
      studyId: visit.study_id,
      amount: paymentAmount,
      currency: visit.local_currency,
      paymentType: visit.payment_type,
      completedProcedures,
      triggeredBy: user.id
    });

    // Publish payment event
    await KafkaManager.publishEvent('payment.edc_triggered', {
      paymentId,
      visitId,
      siteId: visit.site_id,
      studyId: visit.study_id,
      amount: paymentAmount,
      currency: visit.local_currency,
      timestamp: new Date().toISOString()
    });

    return {
      paymentId,
      amount: paymentAmount,
      currency: visit.local_currency,
      status: 'processing'
    };
  }

  /**
   * Handle contract amendments with automatic budget integration
   */
  static async processContractAmendment(
    parentContractId: string,
    amendmentData: any,
    budgetChanges: any[],
    user: any
  ) {
    const client = await DatabaseManager.getClient();
    
    try {
      await client.query('BEGIN');

      // Create amendment contract
      const amendmentId = await this.createAmendmentContract(
        parentContractId,
        amendmentData,
        user,
        client
      );

      // Process budget changes automatically
      for (const budgetChange of budgetChanges) {
        await this.processBudgetAmendment(
          amendmentId,
          budgetChange,
          user,
          client
        );
      }

      // Update version control
      await this.updateContractVersioning(parentContractId, amendmentId, client);

      await client.query('COMMIT');

      // Publish amendment event
      await KafkaManager.publishEvent('contract.amended', {
        parentContractId,
        amendmentId,
        budgetChanges: budgetChanges.length,
        timestamp: new Date().toISOString()
      });

      return {
        amendmentId,
        parentContractId,
        budgetChangesProcessed: budgetChanges.length,
        status: 'active'
      };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Generate comprehensive analytics and reporting
   */
  static async generateAdvancedAnalytics(
    level: 'portfolio' | 'study' | 'site' | 'country',
    entityId: string,
    filters: any,
    user: any
  ) {
    const analytics = {
      budgetTracking: await this.getBudgetAnalytics(level, entityId, filters),
      contractTracking: await this.getContractAnalytics(level, entityId, filters),
      paymentTracking: await this.getPaymentAnalytics(level, entityId, filters),
      cycleTimeReporting: await this.getCycleTimeAnalytics(level, entityId, filters),
      kpis: await this.calculateKPIs(level, entityId, filters)
    };

    // Store analytics results for caching
    await DatabaseManager.query(`
      INSERT INTO analytics_cache (
        level, entity_id, filters, results, generated_by, generated_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
    `, [level, entityId, JSON.stringify(filters), JSON.stringify(analytics), user.id]);

    return analytics;
  }

  // Helper methods
  private static async calculateScenarioForecast(
    studyId: string,
    scenario: ForecastScenario,
    budgetData: any[],
    forecastPeriodMonths: number
  ) {
    const forecast = [];
    const startDate = new Date();

    for (let month = 0; month < forecastPeriodMonths; month++) {
      const forecastDate = new Date(startDate);
      forecastDate.setMonth(startDate.getMonth() + month);

      // Calculate screening, enrollment, dropouts based on scenario assumptions
      const screeningCount = this.calculateMonthlyScreening(scenario, month);
      const enrollmentCount = Math.floor(screeningCount * (1 - scenario.studyAssumptions.screenFailRate));
      const dropoutCount = Math.floor(enrollmentCount * scenario.studyAssumptions.dropoutRate);
      const activeParticipants = enrollmentCount - dropoutCount;

      // Calculate costs based on visit flow and procedures
      const visitCosts = scenario.visitFlow.reduce((total, visit) => {
        return total + (visit.costPerVisit * activeParticipants);
      }, 0);

      // Calculate milestone payments
      const milestonePayments = scenario.milestones
        .filter(m => new Date(m.expectedDate).getMonth() === forecastDate.getMonth())
        .reduce((total, m) => total + (m.paymentAmount * m.probability / 100), 0);

      forecast.push({
        month: forecastDate.toISOString().substring(0, 7),
        screeningCount,
        enrolledParticipants: enrollmentCount,
        dropoutCount,
        activeParticipants,
        visitCosts,
        milestonePayments,
        totalCost: visitCosts + milestonePayments,
        cumulativeEnrollment: forecast.reduce((sum, f) => sum + f.enrolledParticipants || 0, enrollmentCount)
      });
    }

    return forecast;
  }

  private static calculateMonthlyScreening(scenario: ForecastScenario, month: number): number {
    // Implement screening calculation based on enrollment rate and site activation
    const baseScreeningRate = 10; // Base screening per month
    const activationFactor = Math.min(1, (month + 1) * scenario.studyAssumptions.siteActivationRate);
    return Math.floor(baseScreeningRate * scenario.studyAssumptions.enrollmentRate * activationFactor);
  }

  private static async setupVisitBasedPayments(studyId: string, siteId: string, client: any) {
    // Setup automatic triggers for visit-based payments
    await client.query(`
      INSERT INTO payment_triggers (
        study_id, site_id, trigger_type, trigger_condition, payment_calculation
      ) VALUES ($1, $2, 'visit_completed', 'visit.status = completed', 'fixed_rate_per_visit')
    `, [studyId, siteId]);
  }

  private static async setupProcedureBasedPayments(studyId: string, siteId: string, client: any) {
    // Setup automatic triggers for procedure-based payments
    await client.query(`
      INSERT INTO payment_triggers (
        study_id, site_id, trigger_type, trigger_condition, payment_calculation
      ) VALUES ($1, $2, 'procedure_completed', 'procedure.status = completed', 'rate_per_procedure')
    `, [studyId, siteId]);
  }

  private static async getVisitRate(studyId: string, siteId: string, visitType: string): Promise<number> {
    const result = await DatabaseManager.query(`
      SELECT rate FROM visit_rates 
      WHERE study_id = $1 AND site_id = $2 AND visit_type = $3
    `, [studyId, siteId, visitType]);
    
    return result.rows[0]?.rate || 0;
  }

  private static async calculateProcedureBasedPayment(
    studyId: string, 
    siteId: string, 
    procedures: string[]
  ): Promise<number> {
    const result = await DatabaseManager.query(`
      SELECT procedure_name, rate FROM procedure_rates 
      WHERE study_id = $1 AND site_id = $2 AND procedure_name = ANY($3)
    `, [studyId, siteId, procedures]);
    
    return result.rows.reduce((total: number, row: any) => total + row.rate, 0);
  }

  private static async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    // In production, this would call a real exchange rate API
    const result = await DatabaseManager.query(`
      SELECT rate FROM exchange_rates 
      WHERE from_currency = $1 AND to_currency = $2 
      ORDER BY updated_at DESC LIMIT 1
    `, [fromCurrency, toCurrency]);
    
    return result.rows[0]?.rate || 1.0;
  }

  private static async createPaymentRecord(paymentData: any): Promise<string> {
    const result = await DatabaseManager.query(`
      INSERT INTO site_payments (
        visit_id, site_id, study_id, amount, currency, payment_type,
        completed_procedures, triggered_by, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'processing', NOW())
      RETURNING id
    `, [
      paymentData.visitId, paymentData.siteId, paymentData.studyId,
      paymentData.amount, paymentData.currency, paymentData.paymentType,
      JSON.stringify(paymentData.completedProcedures), paymentData.triggeredBy
    ]);
    
    return result.rows[0].id;
  }

  private static async createAmendmentContract(
    parentContractId: string,
    amendmentData: any,
    user: any,
    client: any
  ): Promise<string> {
    const result = await client.query(`
      INSERT INTO contracts (
        contract_type, parent_contract_id, title, description,
        sponsor_organization_id, cro_organization_id, study_id,
        status, created_by, created_at
      ) VALUES ('amendment', $1, $2, $3, $4, $5, $6, 'draft', $7, NOW())
      RETURNING id
    `, [
      parentContractId, amendmentData.title, amendmentData.description,
      amendmentData.sponsorOrganizationId, amendmentData.croOrganizationId,
      amendmentData.studyId, user.id
    ]);
    
    return result.rows[0].id;
  }

  private static async processBudgetAmendment(
    amendmentId: string,
    budgetChange: any,
    user: any,
    client: any
  ) {
    // Process budget changes associated with contract amendment
    await client.query(`
      INSERT INTO budget_amendments (
        amendment_contract_id, original_budget_id, change_type,
        change_amount, change_description, created_by, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `, [
      amendmentId, budgetChange.budgetId, budgetChange.changeType,
      budgetChange.changeAmount, budgetChange.description, user.id
    ]);
  }

  private static async updateContractVersioning(
    parentContractId: string,
    amendmentId: string,
    client: any
  ) {
    // Update contract versioning and tracking
    await client.query(`
      INSERT INTO contract_versions (
        parent_contract_id, amendment_id, version_number, created_at
      ) VALUES ($1, $2, (
        SELECT COALESCE(MAX(version_number), 0) + 1 
        FROM contract_versions 
        WHERE parent_contract_id = $1
      ), NOW())
    `, [parentContractId, amendmentId]);
  }

  private static async getBudgetAnalytics(level: string, entityId: string, filters: any) {
    // Implement budget analytics based on level (portfolio, study, site, country)
    return {
      totalBudget: 0,
      utilizedAmount: 0,
      remainingBudget: 0,
      utilizationPercentage: 0,
      forecastAccuracy: 0
    };
  }

  private static async getContractAnalytics(level: string, entityId: string, filters: any) {
    // Implement contract analytics
    return {
      activeContracts: 0,
      pendingAmendments: 0,
      averageNegotiationTime: 0,
      complianceScore: 0
    };
  }

  private static async getPaymentAnalytics(level: string, entityId: string, filters: any) {
    // Implement payment analytics
    return {
      totalPayments: 0,
      averagePaymentTime: 0,
      overduePayments: 0,
      paymentAccuracy: 0
    };
  }

  private static async getCycleTimeAnalytics(level: string, entityId: string, filters: any) {
    // Implement cycle time analytics
    return {
      contractNegotiationTime: 0,
      budgetApprovalTime: 0,
      paymentProcessingTime: 0,
      amendmentProcessingTime: 0
    };
  }

  private static async calculateKPIs(level: string, entityId: string, filters: any) {
    // Calculate key performance indicators
    return {
      budgetAccuracy: 0,
      paymentTimeliness: 0,
      contractCompliance: 0,
      siteEngagement: 0
    };
  }
}
