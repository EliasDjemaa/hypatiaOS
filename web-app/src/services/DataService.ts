/**
 * Integrated Data Service
 * 
 * Central service that orchestrates data from multiple connectors (EDC, CTMS, ERP)
 * and provides a unified API for the frontend. Handles data aggregation, caching,
 * and real-time updates.
 */

import { getConnectorFactory } from './connectors/ConnectorFactory';
import {
  Study,
  Site,
  Patient,
  EnrollmentData,
  Budget,
  Payment,
  FinancialSnapshot,
  IntegrationLog,
} from '../types/schemas';
import { FetchOptions } from './connectors/interfaces';

export class DataService {
  private static instance: DataService;
  private connectorFactory = getConnectorFactory();
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private subscriptions = new Map<string, Set<(data: any) => void>>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.initializeConnectors();
  }

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  private async initializeConnectors(): Promise<void> {
    try {
      await this.connectorFactory.connectAll();
      console.log('All connectors initialized successfully');
    } catch (error) {
      console.error('Failed to initialize connectors:', error);
    }
  }

  // Study Management
  async getStudy(studyId: string): Promise<Study> {
    const cacheKey = `study-${studyId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const ctmsConnector = this.connectorFactory.createCTMSConnector('mock');
      const study = await ctmsConnector.fetchStudyData(studyId);
      
      // Enrich with enrollment data from EDC
      const edcConnector = this.connectorFactory.createEDCConnector('mock');
      const enrollmentData = await edcConnector.fetchEnrollmentData(studyId, { limit: 1 });
      
      if (enrollmentData.length > 0) {
        const latest = enrollmentData[enrollmentData.length - 1];
        study.currentEnrollment = latest.cumulativeEnrollment;
        study.enrollmentProgress = (latest.cumulativeEnrollment / study.targetEnrollment) * 100;
      }

      // Enrich with financial data from ERP
      const erpConnector = this.connectorFactory.createERPConnector('mock');
      const financialSnapshot = await erpConnector.fetchFinancialSnapshot(studyId);
      study.budgetUtilization = (financialSnapshot.spentAmount / financialSnapshot.totalBudget) * 100;
      study.actualBudget = financialSnapshot.spentAmount;

      this.setCache(cacheKey, study);
      return study;
    } catch (error) {
      console.error(`Failed to fetch study ${studyId}:`, error);
      throw error;
    }
  }

  async getAllStudies(options?: FetchOptions): Promise<Study[]> {
    const cacheKey = `all-studies-${JSON.stringify(options)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const ctmsConnector = this.connectorFactory.createCTMSConnector('mock');
      const studies = await ctmsConnector.fetchAllStudies(options);
      
      // Enrich each study with additional data
      const enrichedStudies = await Promise.all(
        studies.map(async (study) => {
          try {
            // Get enrollment data
            const edcConnector = this.connectorFactory.createEDCConnector('mock');
            const enrollmentData = await edcConnector.fetchEnrollmentData(study.studyId, { limit: 1 });
            
            if (enrollmentData.length > 0) {
              const latest = enrollmentData[enrollmentData.length - 1];
              study.currentEnrollment = latest.cumulativeEnrollment;
              study.enrollmentProgress = (latest.cumulativeEnrollment / study.targetEnrollment) * 100;
            }

            // Get financial snapshot
            const erpConnector = this.connectorFactory.createERPConnector('mock');
            const financialSnapshot = await erpConnector.fetchFinancialSnapshot(study.studyId);
            study.budgetUtilization = (financialSnapshot.spentAmount / financialSnapshot.totalBudget) * 100;
            
            return study;
          } catch (error) {
            console.warn(`Failed to enrich study ${study.studyId}:`, error);
            return study;
          }
        })
      );

      this.setCache(cacheKey, enrichedStudies);
      return enrichedStudies;
    } catch (error) {
      console.error('Failed to fetch all studies:', error);
      throw error;
    }
  }

  // Site Management
  async getSites(studyId: string, options?: FetchOptions): Promise<Site[]> {
    const cacheKey = `sites-${studyId}-${JSON.stringify(options)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const ctmsConnector = this.connectorFactory.createCTMSConnector('mock');
      const sites = await ctmsConnector.fetchSiteData(studyId, undefined, options);
      
      this.setCache(cacheKey, sites);
      return sites;
    } catch (error) {
      console.error(`Failed to fetch sites for study ${studyId}:`, error);
      throw error;
    }
  }

  // Patient and Enrollment Data
  async getEnrollmentData(studyId: string, options?: FetchOptions): Promise<EnrollmentData[]> {
    const cacheKey = `enrollment-${studyId}-${JSON.stringify(options)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const edcConnector = this.connectorFactory.createEDCConnector('mock');
      const enrollmentData = await edcConnector.fetchEnrollmentData(studyId, options);
      
      this.setCache(cacheKey, enrollmentData, 2 * 60 * 1000); // Shorter TTL for enrollment data
      return enrollmentData;
    } catch (error) {
      console.error(`Failed to fetch enrollment data for study ${studyId}:`, error);
      throw error;
    }
  }

  async getPatients(studyId: string, options?: FetchOptions): Promise<Patient[]> {
    const cacheKey = `patients-${studyId}-${JSON.stringify(options)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const edcConnector = this.connectorFactory.createEDCConnector('mock');
      const patients = await edcConnector.fetchPatientData(studyId, options);
      
      this.setCache(cacheKey, patients);
      return patients;
    } catch (error) {
      console.error(`Failed to fetch patients for study ${studyId}:`, error);
      throw error;
    }
  }

  // Financial Data
  async getBudgets(studyId: string, options?: FetchOptions): Promise<Budget[]> {
    const cacheKey = `budgets-${studyId}-${JSON.stringify(options)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const erpConnector = this.connectorFactory.createERPConnector('mock');
      const budgets = await erpConnector.fetchBudgetData(studyId, options);
      
      this.setCache(cacheKey, budgets);
      return budgets;
    } catch (error) {
      console.error(`Failed to fetch budgets for study ${studyId}:`, error);
      throw error;
    }
  }

  async getPayments(studyId: string, siteId?: string, options?: FetchOptions): Promise<Payment[]> {
    const cacheKey = `payments-${studyId}-${siteId || 'all'}-${JSON.stringify(options)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const erpConnector = this.connectorFactory.createERPConnector('mock');
      const payments = await erpConnector.fetchPaymentData(studyId, siteId, options);
      
      this.setCache(cacheKey, payments);
      return payments;
    } catch (error) {
      console.error(`Failed to fetch payments for study ${studyId}:`, error);
      throw error;
    }
  }

  async getFinancialSnapshot(studyId: string): Promise<FinancialSnapshot> {
    const cacheKey = `financial-snapshot-${studyId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const erpConnector = this.connectorFactory.createERPConnector('mock');
      const snapshot = await erpConnector.fetchFinancialSnapshot(studyId);
      
      this.setCache(cacheKey, snapshot, 10 * 60 * 1000); // 10 minute TTL for financial data
      return snapshot;
    } catch (error) {
      console.error(`Failed to fetch financial snapshot for study ${studyId}:`, error);
      throw error;
    }
  }

  // Dashboard Aggregations
  async getDashboardData(studyId?: string): Promise<DashboardData> {
    try {
      const studies = studyId ? [await this.getStudy(studyId)] : await this.getAllStudies({ limit: 10 });
      
      const dashboardData: DashboardData = {
        totalStudies: studies.length,
        activeStudies: studies.filter(s => s.status === 'Active' || s.status === 'Recruiting').length,
        totalEnrollment: studies.reduce((sum, s) => sum + s.currentEnrollment, 0),
        targetEnrollment: studies.reduce((sum, s) => sum + s.targetEnrollment, 0),
        totalBudget: studies.reduce((sum, s) => sum + (s.estimatedBudget || 0), 0),
        budgetUtilized: studies.reduce((sum, s) => sum + (s.actualBudget || 0), 0),
        averageHealthScore: studies.reduce((sum, s) => sum + s.healthScore, 0) / studies.length,
        studiesByPhase: this.groupStudiesByPhase(studies),
        studiesByStatus: this.groupStudiesByStatus(studies),
        recentActivity: await this.getRecentActivity(studyId),
      };

      return dashboardData;
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      throw error;
    }
  }

  // Real-time Subscriptions
  async subscribeToEnrollmentUpdates(studyId: string, callback: (data: EnrollmentData) => void): Promise<string> {
    try {
      const edcConnector = this.connectorFactory.createEDCConnector('mock');
      const subscriptionId = await edcConnector.subscribeToEnrollmentUpdates?.(studyId, callback);
      
      if (subscriptionId) {
        const key = `enrollment-${studyId}`;
        if (!this.subscriptions.has(key)) {
          this.subscriptions.set(key, new Set());
        }
        this.subscriptions.get(key)!.add(callback);
      }
      
      return subscriptionId || `sub-${Date.now()}`;
    } catch (error) {
      console.error(`Failed to subscribe to enrollment updates for study ${studyId}:`, error);
      throw error;
    }
  }

  async unsubscribeFromUpdates(subscriptionId: string): Promise<void> {
    try {
      const edcConnector = this.connectorFactory.createEDCConnector('mock');
      await edcConnector.unsubscribeFromUpdates?.(subscriptionId);
    } catch (error) {
      console.error(`Failed to unsubscribe from updates ${subscriptionId}:`, error);
    }
  }

  // Data Import and Export
  async importStudyData(studyId: string, data: any, source: string): Promise<IntegrationLog> {
    const log: IntegrationLog = {
      id: `import-${Date.now()}`,
      source,
      studyId,
      timestamp: new Date().toISOString(),
      recordsProcessed: Array.isArray(data) ? data.length : 1,
      recordsSuccessful: 0,
      recordsFailed: 0,
      errors: [],
      status: 'Success',
      duration: 0,
    };

    const startTime = Date.now();

    try {
      // Process import data here
      // This would involve validating and storing the imported data
      log.recordsSuccessful = log.recordsProcessed;
      log.status = 'Success';
    } catch (error) {
      log.recordsFailed = log.recordsProcessed;
      log.status = 'Failed';
      log.errors.push({
        recordId: 'unknown',
        error: error instanceof Error ? error.message : 'Unknown error',
        severity: 'Critical',
      });
    }

    log.duration = Date.now() - startTime;
    return log;
  }

  // Health and Status
  async getSystemHealth(): Promise<SystemHealth> {
    try {
      const connectorHealth = await this.connectorFactory.healthCheckAll();
      const connectorStatus = this.connectorFactory.getConnectorStatus();
      
      return {
        overall: Object.values(connectorHealth).every(h => h.status === 'healthy') ? 'healthy' : 'degraded',
        connectors: connectorHealth,
        connections: connectorStatus,
        cacheSize: this.cache.size,
        activeSubscriptions: this.subscriptions.size,
        lastCheck: new Date().toISOString(),
      };
    } catch (error) {
      return {
        overall: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        lastCheck: new Date().toISOString(),
      };
    }
  }

  // Cache Management
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private setCache<T>(key: string, data: T, ttl: number = this.CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  clearCache(): void {
    this.cache.clear();
  }

  // Private helper methods
  private groupStudiesByPhase(studies: Study[]): Record<string, number> {
    return studies.reduce((acc, study) => {
      acc[study.phase] = (acc[study.phase] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupStudiesByStatus(studies: Study[]): Record<string, number> {
    return studies.reduce((acc, study) => {
      acc[study.status] = (acc[study.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private async getRecentActivity(studyId?: string): Promise<ActivityItem[]> {
    // Mock recent activity - in real implementation, this would aggregate
    // recent changes from all connectors
    return [
      {
        id: '1',
        type: 'enrollment',
        message: 'New patient enrolled at Site 001',
        timestamp: new Date().toISOString(),
        studyId: studyId || 'STUDY-001',
      },
      {
        id: '2',
        type: 'payment',
        message: 'Payment processed for Site 002',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        studyId: studyId || 'STUDY-001',
      },
    ];
  }
}

// Supporting interfaces
export interface DashboardData {
  totalStudies: number;
  activeStudies: number;
  totalEnrollment: number;
  targetEnrollment: number;
  totalBudget: number;
  budgetUtilized: number;
  averageHealthScore: number;
  studiesByPhase: Record<string, number>;
  studiesByStatus: Record<string, number>;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'enrollment' | 'payment' | 'monitoring' | 'adverse_event' | 'other';
  message: string;
  timestamp: string;
  studyId: string;
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  connectors?: Record<string, any>;
  connections?: Record<string, boolean>;
  cacheSize?: number;
  activeSubscriptions?: number;
  lastCheck: string;
  error?: string;
}

// Singleton instance
export const dataService = DataService.getInstance();
export default dataService;
