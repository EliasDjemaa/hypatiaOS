import { DatabaseManager } from '../database/DatabaseManager';
import { KafkaManager } from '../events/KafkaManager';
import { AuditService } from './AuditService';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import Decimal from 'decimal.js';

export interface Budget {
  id: string;
  budgetNumber: string;
  contractId: string;
  studyId: string;
  siteId?: string;
  budgetType: string;
  totalBudget: number;
  currency: string;
  status: string;
  budgetPeriodStart: Date;
  budgetPeriodEnd: Date;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface BudgetLineItem {
  id: string;
  budgetId: string;
  lineItemNumber: string;
  category: string;
  description: string;
  unitType: string;
  unitRate: number;
  estimatedUnits: number;
  totalAmount: number;
  milestoneTriggger?: string;
  milestonePercentage: number;
  isInvoiceable: boolean;
  invoiceSchedule: string;
  createdAt: Date;
  updatedAt: Date;
}

export class BudgetService {

  static async getBudgets(
    page: number = 1,
    limit: number = 20,
    filters: any = {},
    user: any
  ) {
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT b.*, 
             c.title as contract_title,
             s.title as study_title,
             st.name as site_name,
             u.display_name as approved_by_name
      FROM budgets b
      LEFT JOIN contracts c ON b.contract_id = c.id
      LEFT JOIN studies s ON b.study_id = s.id
      LEFT JOIN sites st ON b.site_id = st.id
      LEFT JOIN users u ON b.approved_by = u.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;

    // Apply organization-based filtering
    if (user.role !== 'admin') {
      query += ` AND (c.sponsor_organization_id = $${paramIndex} OR c.cro_organization_id = $${paramIndex})`;
      params.push(user.organizationId);
      paramIndex++;
    }

    if (filters.status) {
      query += ` AND b.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.budgetType) {
      query += ` AND b.budget_type = $${paramIndex}`;
      params.push(filters.budgetType);
      paramIndex++;
    }

    if (filters.studyId) {
      query += ` AND b.study_id = $${paramIndex}`;
      params.push(filters.studyId);
      paramIndex++;
    }

    if (filters.siteId) {
      query += ` AND b.site_id = $${paramIndex}`;
      params.push(filters.siteId);
      paramIndex++;
    }

    if (filters.contractId) {
      query += ` AND b.contract_id = $${paramIndex}`;
      params.push(filters.contractId);
      paramIndex++;
    }

    // Count total records
    const countQuery = query.replace(
      'SELECT b.*, c.title as contract_title, s.title as study_title, st.name as site_name, u.display_name as approved_by_name', 
      'SELECT COUNT(*)'
    );
    const countResult = await DatabaseManager.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Add pagination
    query += ` ORDER BY b.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await DatabaseManager.query(query, params);

    return {
      budgets: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async getBudgetById(budgetId: string, user: any): Promise<Budget | null> {
    const query = `
      SELECT b.*, 
             c.title as contract_title,
             s.title as study_title,
             st.name as site_name,
             u.display_name as approved_by_name
      FROM budgets b
      LEFT JOIN contracts c ON b.contract_id = c.id
      LEFT JOIN studies s ON b.study_id = s.id
      LEFT JOIN sites st ON b.site_id = st.id
      LEFT JOIN users u ON b.approved_by = u.id
      WHERE b.id = $1
    `;

    const result = await DatabaseManager.query(query, [budgetId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const budget = result.rows[0];

    // Check access permissions through contract
    const contractCheck = await DatabaseManager.query(
      'SELECT sponsor_organization_id, cro_organization_id FROM contracts WHERE id = $1',
      [budget.contract_id]
    );

    if (contractCheck.rows.length === 0) {
      return null;
    }

    const contract = contractCheck.rows[0];
    if (user.role !== 'admin' && 
        contract.sponsor_organization_id !== user.organizationId && 
        contract.cro_organization_id !== user.organizationId) {
      throw new Error('Access denied');
    }

    return budget;
  }

  static async createBudget(budgetData: any, user: any): Promise<Budget> {
    const budgetId = uuidv4();
    const budgetNumber = await this.generateBudgetNumber(budgetData.budgetType);

    // Verify contract access
    const contractCheck = await DatabaseManager.query(
      'SELECT sponsor_organization_id, cro_organization_id FROM contracts WHERE id = $1',
      [budgetData.contractId]
    );

    if (contractCheck.rows.length === 0) {
      throw new Error('Contract not found');
    }

    const contract = contractCheck.rows[0];
    if (user.role !== 'admin' && 
        contract.sponsor_organization_id !== user.organizationId && 
        contract.cro_organization_id !== user.organizationId) {
      throw new Error('Access denied');
    }

    // Start transaction
    const client = await DatabaseManager.getClient();
    
    try {
      await client.query('BEGIN');

      // Create budget
      const budgetQuery = `
        INSERT INTO budgets (
          id, budget_number, contract_id, study_id, site_id, budget_type,
          total_budget, currency, budget_period_start, budget_period_end, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;

      const budgetResult = await client.query(budgetQuery, [
        budgetId,
        budgetNumber,
        budgetData.contractId,
        budgetData.studyId,
        budgetData.siteId || null,
        budgetData.budgetType,
        budgetData.totalBudget,
        budgetData.currency || 'USD',
        budgetData.budgetPeriodStart,
        budgetData.budgetPeriodEnd,
        user.id
      ]);

      const budget = budgetResult.rows[0];

      // Create line items
      if (budgetData.lineItems && budgetData.lineItems.length > 0) {
        for (let i = 0; i < budgetData.lineItems.length; i++) {
          const lineItem = budgetData.lineItems[i];
          const lineItemId = uuidv4();
          const lineItemNumber = `${i + 1}`.padStart(3, '0');

          await client.query(`
            INSERT INTO budget_line_items (
              id, budget_id, line_item_number, category, description,
              unit_type, unit_rate, estimated_units, milestone_trigger,
              milestone_percentage, invoice_schedule
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          `, [
            lineItemId,
            budgetId,
            lineItemNumber,
            lineItem.category,
            lineItem.description,
            lineItem.unitType,
            lineItem.unitRate,
            lineItem.estimatedUnits,
            lineItem.milestoneTriggger || null,
            lineItem.milestonePercentage || 100,
            lineItem.invoiceSchedule || 'upon_completion'
          ]);
        }
      }

      await client.query('COMMIT');

      // Log audit event
      await AuditService.logEvent({
        eventType: 'budget_created',
        objectType: 'budget',
        objectId: budgetId,
        newValues: budget,
        userId: user.id,
        ipAddress: user.ipAddress,
        userAgent: user.userAgent
      });

      // Publish event
      await KafkaManager.publishEvent('budget.created', {
        budgetId,
        contractId: budgetData.contractId,
        studyId: budgetData.studyId,
        siteId: budgetData.siteId,
        totalBudget: budgetData.totalBudget,
        createdBy: user.id,
        timestamp: new Date().toISOString()
      });

      logger.info(`Budget created: ${budgetId} by user ${user.id}`);

      return budget;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async updateBudget(budgetId: string, updates: any, user: any): Promise<Budget | null> {
    const existingBudget = await this.getBudgetById(budgetId, user);
    if (!existingBudget) {
      return null;
    }

    if (existingBudget.status === 'approved' || existingBudget.status === 'active') {
      throw new Error('Cannot modify approved or active budgets');
    }

    // Build update query
    const updateFields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${this.camelToSnake(key)} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return existingBudget;
    }

    updateFields.push(`updated_at = NOW()`);

    const query = `
      UPDATE budgets 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    params.push(budgetId);

    const result = await DatabaseManager.query(query, params);
    const updatedBudget = result.rows[0];

    // Log audit event
    await AuditService.logEvent({
      eventType: 'budget_updated',
      objectType: 'budget',
      objectId: budgetId,
      oldValues: existingBudget,
      newValues: updatedBudget,
      userId: user.id,
      ipAddress: user.ipAddress,
      userAgent: user.userAgent
    });

    logger.info(`Budget updated: ${budgetId} by user ${user.id}`);

    return updatedBudget;
  }

  static async approveBudget(budgetId: string, user: any) {
    const budget = await this.getBudgetById(budgetId, user);
    if (!budget) {
      throw new Error('Budget not found');
    }

    if (budget.status !== 'submitted') {
      throw new Error('Only submitted budgets can be approved');
    }

    // Check if user has approval permissions
    if (!['sponsor_pm', 'cro_finance', 'admin'].includes(user.role)) {
      throw new Error('Insufficient permissions to approve budget');
    }

    const query = `
      UPDATE budgets 
      SET status = 'approved',
          approved_by = $1,
          approved_at = NOW(),
          updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const result = await DatabaseManager.query(query, [user.id, budgetId]);
    const approvedBudget = result.rows[0];

    // Log audit event
    await AuditService.logEvent({
      eventType: 'budget_approved',
      objectType: 'budget',
      objectId: budgetId,
      newValues: { approvedBy: user.id, approvedAt: new Date() },
      userId: user.id,
      ipAddress: user.ipAddress,
      userAgent: user.userAgent
    });

    // Publish event
    await KafkaManager.publishEvent('budget.approved', {
      budgetId,
      approvedBy: user.id,
      approvedAt: new Date().toISOString(),
      timestamp: new Date().toISOString()
    });

    logger.info(`Budget approved: ${budgetId} by user ${user.id}`);

    return approvedBudget;
  }

  static async getBudgetLineItems(budgetId: string, user: any): Promise<BudgetLineItem[]> {
    const budget = await this.getBudgetById(budgetId, user);
    if (!budget) {
      throw new Error('Budget not found');
    }

    const query = `
      SELECT * FROM budget_line_items 
      WHERE budget_id = $1 
      ORDER BY line_item_number
    `;

    const result = await DatabaseManager.query(query, [budgetId]);
    return result.rows;
  }

  static async updateLineItem(budgetId: string, lineItemId: string, updates: any, user: any) {
    const budget = await this.getBudgetById(budgetId, user);
    if (!budget) {
      throw new Error('Budget not found');
    }

    if (budget.status === 'approved' || budget.status === 'active') {
      throw new Error('Cannot modify line items of approved or active budgets');
    }

    const updateFields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${this.camelToSnake(key)} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return null;
    }

    updateFields.push(`updated_at = NOW()`);

    const query = `
      UPDATE budget_line_items 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex} AND budget_id = $${paramIndex + 1}
      RETURNING *
    `;
    params.push(lineItemId, budgetId);

    const result = await DatabaseManager.query(query, params);
    
    if (result.rows.length === 0) {
      return null;
    }

    logger.info(`Budget line item updated: ${lineItemId} by user ${user.id}`);

    return result.rows[0];
  }

  static async getBudgetUtilization(budgetId: string, user: any) {
    const budget = await this.getBudgetById(budgetId, user);
    if (!budget) {
      throw new Error('Budget not found');
    }

    // Get line items with invoicing status
    const query = `
      SELECT 
        bli.*,
        COALESCE(SUM(i.invoice_amount), 0) as invoiced_amount,
        COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.invoice_amount ELSE 0 END), 0) as paid_amount,
        COUNT(i.id) as invoice_count
      FROM budget_line_items bli
      LEFT JOIN invoices i ON i.budget_line_item_id = bli.id
      WHERE bli.budget_id = $1
      GROUP BY bli.id
      ORDER BY bli.line_item_number
    `;

    const result = await DatabaseManager.query(query, [budgetId]);
    const lineItems = result.rows;

    // Calculate totals
    const totals = lineItems.reduce((acc, item) => {
      acc.budgetedAmount += parseFloat(item.total_amount) || 0;
      acc.invoicedAmount += parseFloat(item.invoiced_amount) || 0;
      acc.paidAmount += parseFloat(item.paid_amount) || 0;
      return acc;
    }, { budgetedAmount: 0, invoicedAmount: 0, paidAmount: 0 });

    const utilizationPercentage = totals.budgetedAmount > 0 
      ? (totals.invoicedAmount / totals.budgetedAmount) * 100 
      : 0;

    const paymentPercentage = totals.invoicedAmount > 0 
      ? (totals.paidAmount / totals.invoicedAmount) * 100 
      : 0;

    return {
      budget,
      lineItems,
      summary: {
        ...totals,
        remainingBudget: totals.budgetedAmount - totals.invoicedAmount,
        utilizationPercentage: Math.round(utilizationPercentage * 100) / 100,
        paymentPercentage: Math.round(paymentPercentage * 100) / 100
      }
    };
  }

  static async generateForecast(budgetId: string, months: number, user: any) {
    const budget = await this.getBudgetById(budgetId, user);
    if (!budget) {
      throw new Error('Budget not found');
    }

    // Get milestone events and projected timeline
    const query = `
      SELECT 
        bli.*,
        me.event_date,
        me.event_type
      FROM budget_line_items bli
      LEFT JOIN milestone_events me ON me.study_id = $1 
        AND (
          (bli.milestone_trigger = 'first_patient_in' AND me.event_type = 'first_patient_in') OR
          (bli.milestone_trigger = 'site_activation' AND me.event_type = 'site_activation') OR
          (bli.milestone_trigger = 'database_lock' AND me.event_type = 'database_lock')
        )
      WHERE bli.budget_id = $2
      ORDER BY bli.line_item_number
    `;

    const result = await DatabaseManager.query(query, [budget.study_id, budgetId]);
    const lineItems = result.rows;

    // Generate monthly forecast
    const forecast = [];
    const startDate = new Date();
    
    for (let i = 0; i < months; i++) {
      const forecastDate = new Date(startDate);
      forecastDate.setMonth(startDate.getMonth() + i);
      
      let monthlyBudget = 0;
      let monthlyInvoiced = 0;
      
      // Calculate expected costs for this month
      lineItems.forEach(item => {
        if (item.invoice_schedule === 'monthly') {
          monthlyBudget += parseFloat(item.total_amount) / months;
        } else if (item.event_date) {
          const eventDate = new Date(item.event_date);
          if (eventDate.getMonth() === forecastDate.getMonth() && 
              eventDate.getFullYear() === forecastDate.getFullYear()) {
            monthlyBudget += parseFloat(item.total_amount);
          }
        }
      });

      forecast.push({
        month: forecastDate.toISOString().substring(0, 7), // YYYY-MM format
        budgetedAmount: Math.round(monthlyBudget * 100) / 100,
        projectedInvoiced: Math.round(monthlyInvoiced * 100) / 100,
        cumulativeBudget: forecast.reduce((sum, f) => sum + f.budgetedAmount, monthlyBudget)
      });
    }

    return {
      budget,
      forecastPeriod: `${months} months`,
      forecast
    };
  }

  static async copyBudget(
    sourceBudgetId: string, 
    targetStudyId: string, 
    targetSiteId: string | null, 
    adjustmentFactor: number,
    user: any
  ) {
    const sourceBudget = await this.getBudgetById(sourceBudgetId, user);
    if (!sourceBudget) {
      throw new Error('Source budget not found');
    }

    const sourceLineItems = await this.getBudgetLineItems(sourceBudgetId, user);

    const newBudgetId = uuidv4();
    const budgetNumber = await this.generateBudgetNumber(sourceBudget.budget_type);

    const client = await DatabaseManager.getClient();
    
    try {
      await client.query('BEGIN');

      // Create new budget
      const newTotalBudget = new Decimal(sourceBudget.total_budget).mul(adjustmentFactor).toNumber();
      
      const budgetQuery = `
        INSERT INTO budgets (
          id, budget_number, contract_id, study_id, site_id, budget_type,
          total_budget, currency, budget_period_start, budget_period_end, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;

      const budgetResult = await client.query(budgetQuery, [
        newBudgetId,
        budgetNumber,
        sourceBudget.contract_id,
        targetStudyId,
        targetSiteId,
        sourceBudget.budget_type,
        newTotalBudget,
        sourceBudget.currency,
        sourceBudget.budget_period_start,
        sourceBudget.budget_period_end,
        user.id
      ]);

      // Copy line items
      for (const sourceItem of sourceLineItems) {
        const newLineItemId = uuidv4();
        const newUnitRate = new Decimal(sourceItem.unit_rate).mul(adjustmentFactor).toNumber();

        await client.query(`
          INSERT INTO budget_line_items (
            id, budget_id, line_item_number, category, description,
            unit_type, unit_rate, estimated_units, milestone_trigger,
            milestone_percentage, invoice_schedule
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          newLineItemId,
          newBudgetId,
          sourceItem.line_item_number,
          sourceItem.category,
          sourceItem.description,
          sourceItem.unit_type,
          newUnitRate,
          sourceItem.estimated_units,
          sourceItem.milestone_trigger,
          sourceItem.milestone_percentage,
          sourceItem.invoice_schedule
        ]);
      }

      await client.query('COMMIT');

      logger.info(`Budget copied: ${sourceBudgetId} -> ${newBudgetId} by user ${user.id}`);

      return budgetResult.rows[0];

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getBudgetTemplates(budgetType?: string, therapeuticArea?: string, user?: any) {
    let query = `
      SELECT DISTINCT
        budget_type,
        category,
        AVG(unit_rate) as avg_unit_rate,
        unit_type,
        COUNT(*) as usage_count
      FROM budget_line_items bli
      JOIN budgets b ON bli.budget_id = b.id
      WHERE b.status IN ('approved', 'active', 'completed')
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (budgetType) {
      query += ` AND b.budget_type = $${paramIndex}`;
      params.push(budgetType);
      paramIndex++;
    }

    query += `
      GROUP BY budget_type, category, unit_type
      HAVING COUNT(*) >= 3
      ORDER BY budget_type, category, usage_count DESC
    `;

    const result = await DatabaseManager.query(query, params);

    // Group by budget type and category
    const templates = result.rows.reduce((acc: any, row: any) => {
      if (!acc[row.budget_type]) {
        acc[row.budget_type] = {};
      }
      if (!acc[row.budget_type][row.category]) {
        acc[row.budget_type][row.category] = [];
      }
      
      acc[row.budget_type][row.category].push({
        unitType: row.unit_type,
        avgUnitRate: Math.round(parseFloat(row.avg_unit_rate) * 100) / 100,
        usageCount: parseInt(row.usage_count)
      });
      
      return acc;
    }, {});

    return templates;
  }

  private static async generateBudgetNumber(budgetType: string): Promise<string> {
    const prefix = this.getBudgetPrefix(budgetType);
    const year = new Date().getFullYear();
    
    const query = `
      SELECT COUNT(*) as count 
      FROM budgets 
      WHERE budget_number LIKE $1 
      AND EXTRACT(YEAR FROM created_at) = $2
    `;
    
    const result = await DatabaseManager.query(query, [`${prefix}-${year}-%`, year]);
    const count = parseInt(result.rows[0].count) + 1;
    
    return `${prefix}-${year}-${count.toString().padStart(4, '0')}`;
  }

  private static getBudgetPrefix(budgetType: string): string {
    const prefixes: { [key: string]: string } = {
      'study_level': 'SB',
      'site_level': 'STB',
      'pass_through': 'PTB',
      'startup': 'SUB',
      'closeout': 'COB'
    };
    
    return prefixes[budgetType] || 'BUD';
  }

  private static camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}
