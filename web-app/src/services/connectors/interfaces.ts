/**
 * HypatiaOS Integration Connector Interfaces
 * 
 * Modular connector interfaces for external systems (EDC, CTMS, ERP, etc.)
 * These interfaces define the contract for data exchange, allowing seamless
 * swapping between mock implementations and real API integrations.
 */

import {
  Study,
  Site,
  Patient,
  PatientVisit,
  EnrollmentData,
  Budget,
  Payment,
  FinancialSnapshot,
  MonitoringVisit,
  AdverseEvent,
  ProtocolDeviation,
  IntegrationLog,
} from '../../types/schemas';

// Base connector interface with common functionality
export interface BaseConnector {
  readonly name: string;
  readonly version: string;
  readonly type: ConnectorType;
  
  // Connection management
  connect(): Promise<boolean>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  
  // Health check
  healthCheck(): Promise<ConnectorHealth>;
  
  // Authentication
  authenticate(credentials: ConnectorCredentials): Promise<boolean>;
  refreshToken?(): Promise<string>;
}

export type ConnectorType = 'EDC' | 'CTMS' | 'ERP' | 'eTMF' | 'IRT' | 'MOCK';

export interface ConnectorHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number; // milliseconds
  lastCheck: string;
  errors?: string[];
}

export interface ConnectorCredentials {
  apiKey?: string;
  username?: string;
  password?: string;
  clientId?: string;
  clientSecret?: string;
  endpoint?: string;
  additionalParams?: Record<string, any>;
}

// EDC (Electronic Data Capture) Connector Interface
export interface EDCConnector extends BaseConnector {
  type: 'EDC';
  
  // Patient and enrollment data
  fetchEnrollmentData(studyId: string, options?: FetchOptions): Promise<EnrollmentData[]>;
  fetchPatientData(studyId: string, options?: FetchOptions): Promise<Patient[]>;
  fetchPatientVisitData(studyId: string, patientId?: string, options?: FetchOptions): Promise<PatientVisit[]>;
  
  // Clinical data
  fetchAdverseEvents(studyId: string, options?: FetchOptions): Promise<AdverseEvent[]>;
  fetchProtocolDeviations(studyId: string, options?: FetchOptions): Promise<ProtocolDeviation[]>;
  
  // Data quality metrics
  getDataCompleteness(studyId: string): Promise<DataCompletenessReport>;
  getQueryMetrics(studyId: string): Promise<QueryMetrics>;
  
  // Real-time subscriptions (if supported)
  subscribeToEnrollmentUpdates?(studyId: string, callback: (data: EnrollmentData) => void): Promise<string>;
  unsubscribeFromUpdates?(subscriptionId: string): Promise<void>;
}

// CTMS (Clinical Trial Management System) Connector Interface
export interface CTMSConnector extends BaseConnector {
  type: 'CTMS';
  
  // Study management
  fetchStudyData(studyId: string, options?: FetchOptions): Promise<Study>;
  fetchAllStudies(options?: FetchOptions): Promise<Study[]>;
  updateStudyStatus(studyId: string, status: string): Promise<boolean>;
  
  // Site management
  fetchSiteData(studyId: string, siteId?: string, options?: FetchOptions): Promise<Site[]>;
  fetchSiteActivationStatus(studyId: string): Promise<SiteActivationReport>;
  updateSiteStatus(studyId: string, siteId: string, status: string): Promise<boolean>;
  
  // Monitoring
  fetchMonitoringVisits(studyId: string, siteId?: string, options?: FetchOptions): Promise<MonitoringVisit[]>;
  scheduleMonitoringVisit(visit: Partial<MonitoringVisit>): Promise<string>;
  
  // Budget and timeline
  fetchBudgetUtilization(studyId: string): Promise<BudgetUtilizationReport>;
  fetchStudyTimeline(studyId: string): Promise<StudyTimeline>;
}

// ERP (Enterprise Resource Planning) Connector Interface
export interface ERPConnector extends BaseConnector {
  type: 'ERP';
  
  // Financial data
  fetchBudgetData(studyId: string, options?: FetchOptions): Promise<Budget[]>;
  fetchPaymentData(studyId: string, siteId?: string, options?: FetchOptions): Promise<Payment[]>;
  fetchFinancialSnapshot(studyId: string, date?: string): Promise<FinancialSnapshot>;
  
  // Payment processing
  processPayment(payment: Partial<Payment>): Promise<string>;
  approvePayment(paymentId: string, approverId: string): Promise<boolean>;
  generateInvoice(studyId: string, siteId: string, items: InvoiceItem[]): Promise<string>;
  
  // Financial reporting
  getSpendAnalysis(studyId: string, period: DateRange): Promise<SpendAnalysis>;
  getBurnRateAnalysis(studyId: string): Promise<BurnRateAnalysis>;
  getForecastAccuracy(studyId: string): Promise<ForecastAccuracy>;
}

// eTMF (Electronic Trial Master File) Connector Interface
export interface eTMFConnector extends BaseConnector {
  type: 'eTMF';
  
  // Document management
  fetchDocuments(studyId: string, category?: string, options?: FetchOptions): Promise<TMFDocument[]>;
  uploadDocument(studyId: string, document: TMFDocumentUpload): Promise<string>;
  getDocumentStatus(studyId: string): Promise<TMFComplianceReport>;
  
  // Regulatory compliance
  getInspectionReadiness(studyId: string): Promise<InspectionReadinessReport>;
  generateTMFReport(studyId: string, format: 'PDF' | 'Excel'): Promise<string>;
}

// IRT (Interactive Response Technology) Connector Interface
export interface IRTConnector extends BaseConnector {
  type: 'IRT';
  
  // Randomization and supply
  fetchRandomizationData(studyId: string, options?: FetchOptions): Promise<RandomizationData[]>;
  fetchDrugSupplyData(studyId: string, siteId?: string): Promise<DrugSupplyData[]>;
  
  // Inventory management
  getSupplyForecasting(studyId: string): Promise<SupplyForecast>;
  requestSupplyShipment(studyId: string, siteId: string, items: SupplyItem[]): Promise<string>;
}

// Supporting interfaces and types
export interface FetchOptions {
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  includeInactive?: boolean;
  fields?: string[];
  filters?: Record<string, any>;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface DataCompletenessReport {
  studyId: string;
  overallCompleteness: number; // percentage
  siteCompleteness: Array<{
    siteId: string;
    completeness: number;
    missingForms: number;
    totalForms: number;
  }>;
  formCompleteness: Array<{
    formName: string;
    completeness: number;
    completedCount: number;
    totalCount: number;
  }>;
  generatedAt: string;
}

export interface QueryMetrics {
  studyId: string;
  totalQueries: number;
  openQueries: number;
  resolvedQueries: number;
  averageResolutionTime: number; // hours
  queriesByType: Array<{
    type: string;
    count: number;
  }>;
  queriesBySite: Array<{
    siteId: string;
    openQueries: number;
    resolvedQueries: number;
  }>;
}

export interface SiteActivationReport {
  studyId: string;
  totalSites: number;
  activatedSites: number;
  pendingSites: number;
  activationTimeline: Array<{
    siteId: string;
    plannedActivation: string;
    actualActivation?: string;
    status: string;
  }>;
}

export interface BudgetUtilizationReport {
  studyId: string;
  totalBudget: number;
  utilizedBudget: number;
  utilizationPercentage: number;
  budgetByCategory: Array<{
    category: string;
    planned: number;
    actual: number;
    variance: number;
  }>;
  budgetBySite: Array<{
    siteId: string;
    planned: number;
    actual: number;
    variance: number;
  }>;
}

export interface StudyTimeline {
  studyId: string;
  milestones: Array<{
    name: string;
    plannedDate: string;
    actualDate?: string;
    status: 'Not Started' | 'In Progress' | 'Completed' | 'Delayed';
    dependencies?: string[];
  }>;
  criticalPath: string[];
  projectedCompletion: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
}

export interface SpendAnalysis {
  studyId: string;
  period: DateRange;
  totalSpend: number;
  spendByCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  spendBySite: Array<{
    siteId: string;
    amount: number;
    percentage: number;
  }>;
  trends: Array<{
    month: string;
    amount: number;
  }>;
}

export interface BurnRateAnalysis {
  studyId: string;
  currentBurnRate: number; // per month
  projectedBurnRate: number;
  budgetRunwayMonths: number;
  burnRateHistory: Array<{
    month: string;
    burnRate: number;
  }>;
}

export interface ForecastAccuracy {
  studyId: string;
  enrollmentAccuracy: number; // percentage
  budgetAccuracy: number; // percentage
  timelineAccuracy: number; // percentage
  historicalForecasts: Array<{
    forecastDate: string;
    metric: string;
    predicted: number;
    actual: number;
    accuracy: number;
  }>;
}

export interface TMFDocument {
  documentId: string;
  studyId: string;
  siteId?: string;
  category: string;
  title: string;
  version: string;
  status: 'Draft' | 'Final' | 'Superseded';
  uploadDate: string;
  expiryDate?: string;
  fileSize: number;
  fileType: string;
}

export interface TMFDocumentUpload {
  category: string;
  title: string;
  file: File | Buffer;
  siteId?: string;
  expiryDate?: string;
  metadata?: Record<string, any>;
}

export interface TMFComplianceReport {
  studyId: string;
  overallCompliance: number; // percentage
  requiredDocuments: number;
  submittedDocuments: number;
  approvedDocuments: number;
  expiredDocuments: number;
  missingDocuments: string[];
  complianceBySite: Array<{
    siteId: string;
    compliance: number;
    missingDocuments: string[];
  }>;
}

export interface InspectionReadinessReport {
  studyId: string;
  readinessScore: number; // 0-100
  criticalIssues: string[];
  recommendedActions: string[];
  documentCompleteness: number;
  dataIntegrity: number;
  regulatoryCompliance: number;
}

export interface RandomizationData {
  patientId: string;
  studyId: string;
  siteId: string;
  randomizationDate: string;
  treatmentArm: string;
  stratificationFactors?: Record<string, string>;
  kitNumber?: string;
}

export interface DrugSupplyData {
  studyId: string;
  siteId: string;
  kitNumber: string;
  treatmentArm: string;
  expiryDate: string;
  status: 'Available' | 'Dispensed' | 'Returned' | 'Expired';
  dispensedDate?: string;
  patientId?: string;
}

export interface SupplyForecast {
  studyId: string;
  forecastDate: string;
  supplyByArm: Array<{
    treatmentArm: string;
    currentStock: number;
    projectedNeed: number;
    recommendedOrder: number;
    stockoutRisk: 'Low' | 'Medium' | 'High';
  }>;
  supplyBySite: Array<{
    siteId: string;
    currentStock: number;
    projectedNeed: number;
    nextShipmentDate?: string;
  }>;
}

export interface SupplyItem {
  treatmentArm: string;
  quantity: number;
  urgency: 'Standard' | 'Expedited' | 'Emergency';
}

// Connector factory interface for dependency injection
export interface ConnectorFactory {
  createEDCConnector(type: string, credentials?: ConnectorCredentials): EDCConnector;
  createCTMSConnector(type: string, credentials?: ConnectorCredentials): CTMSConnector;
  createERPConnector(type: string, credentials?: ConnectorCredentials): ERPConnector;
  createeTMFConnector(type: string, credentials?: ConnectorCredentials): eTMFConnector;
  createIRTConnector(type: string, credentials?: ConnectorCredentials): IRTConnector;
}

// Export all interfaces
export type {
  BaseConnector,
  EDCConnector,
  CTMSConnector,
  ERPConnector,
  eTMFConnector,
  IRTConnector,
  ConnectorFactory,
};
