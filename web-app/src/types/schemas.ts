/**
 * HypatiaOS Data Schema Registry
 * 
 * Master schemas for all clinical trial entities.
 * These schemas are integration-agnostic and serve as the single source of truth
 * for data structure across all connectors (EDC, CTMS, ERP, etc.)
 */

// Base entity with common fields
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  createdBy: string;
  lastModifiedBy: string;
}

// Study Entity - Core entity around which all operations are organized
export interface Study extends BaseEntity {
  studyId: string; // Protocol identifier (business key)
  title: string;
  sponsor: string;
  therapeuticArea: string;
  phase: StudyPhase;
  targetEnrollment: number;
  currentEnrollment: number;
  enrollmentProgress: number; // Calculated percentage
  sitesActivated: number;
  totalSites: number;
  startDate: string;
  plannedEndDate: string;
  actualEndDate?: string;
  status: StudyStatus;
  healthScore: number; // 0-100 composite health indicator
  healthIndicator: 'excellent' | 'good' | 'warning' | 'critical';
  currency: string;
  estimatedBudget: number;
  actualBudget?: number;
  budgetUtilization: number; // Percentage of budget used
  lastDataSync?: string; // Last integration sync timestamp
  dataSource: DataSource;
}

export type StudyPhase = 'Phase I' | 'Phase II' | 'Phase III' | 'Phase IV' | 'Pivotal' | 'Real World Evidence';
export type StudyStatus = 'Planned' | 'Initiated' | 'Recruiting' | 'Active' | 'Suspended' | 'Completed' | 'Terminated';
export type DataSource = 'manual' | 'ctms' | 'edc' | 'import' | 'simulation';

// Site Entity - Individual research sites participating in studies
export interface Site extends BaseEntity {
  siteId: string;
  studyId: string;
  siteName: string;
  country: string;
  city: string;
  principalInvestigator: string;
  piEmail: string;
  piPhone?: string;
  coordinatorName?: string;
  coordinatorEmail?: string;
  status: SiteStatus;
  activationDate?: string;
  firstPatientIn?: string;
  lastPatientOut?: string;
  targetEnrollment: number;
  currentEnrollment: number;
  enrollmentRate: number; // Patients per month
  completedVisits: number;
  missedVisits: number;
  protocolDeviations: number;
  monitoringVisits: MonitoringVisit[];
  paymentStatus: PaymentStatus;
  totalPayments: number;
  outstandingPayments: number;
}

export type SiteStatus = 'Selected' | 'Contracted' | 'Initiated' | 'Recruiting' | 'Completed' | 'Closed' | 'Terminated';
export type PaymentStatus = 'Current' | 'Overdue' | 'Pending' | 'Suspended';

// Patient Entity - Individual study participants
export interface Patient extends BaseEntity {
  patientId: string; // Anonymized patient identifier
  studyId: string;
  siteId: string;
  screeningNumber?: string;
  randomizationNumber?: string;
  enrollmentDate: string;
  randomizationDate?: string;
  status: PatientStatus;
  arm?: string; // Treatment arm
  visits: PatientVisit[];
  adverseEvents: AdverseEvent[];
  protocolDeviations: ProtocolDeviation[];
  withdrawalDate?: string;
  withdrawalReason?: string;
  completionDate?: string;
}

export type PatientStatus = 'Screened' | 'Enrolled' | 'Randomized' | 'Active' | 'Completed' | 'Withdrawn' | 'Lost to Follow-up';

// Patient Visit - Individual patient visits/appointments
export interface PatientVisit extends BaseEntity {
  visitId: string;
  patientId: string;
  studyId: string;
  siteId: string;
  visitName: string; // e.g., "Screening", "Baseline", "Week 4"
  visitNumber: number;
  scheduledDate: string;
  actualDate?: string;
  status: VisitStatus;
  formsCompleted: number;
  formsTotal: number;
  queriesOpen: number;
  queriesResolved: number;
  sdvStatus: SDVStatus; // Source Data Verification
  monitoringNotes?: string;
}

export type VisitStatus = 'Scheduled' | 'Completed' | 'Missed' | 'Rescheduled' | 'Cancelled';
export type SDVStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Verified';

// Budget Entity - Financial planning and tracking
export interface Budget extends BaseEntity {
  budgetId: string;
  studyId: string;
  siteId?: string; // Site-specific budget or null for study-level
  budgetType: BudgetType;
  category: BudgetCategory;
  plannedAmount: number;
  actualAmount: number;
  variance: number; // Calculated: actual - planned
  variancePercentage: number;
  currency: string;
  fiscalYear: string;
  quarter: string;
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
  approvedDate?: string;
  notes?: string;
}

export type BudgetType = 'Study Level' | 'Site Level' | 'Patient Level' | 'Visit Level';
export type BudgetCategory = 'Site Fees' | 'Patient Fees' | 'Monitoring' | 'Laboratory' | 'Imaging' | 'Drug Supply' | 'Other';
export type ApprovalStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected' | 'Expired';

// Payment Entity - Financial transactions and payments
export interface Payment extends BaseEntity {
  paymentId: string;
  studyId: string;
  siteId: string;
  invoiceId?: string;
  paymentType: PaymentType;
  amount: number;
  currency: string;
  dueDate: string;
  paidDate?: string;
  status: PaymentStatus;
  method?: PaymentMethod;
  reference?: string;
  description: string;
  milestoneId?: string; // Link to milestone-based payments
  patientCount?: number; // For per-patient payments
  visitCount?: number; // For per-visit payments
  approvedBy?: string;
  processedBy?: string;
  bankDetails?: BankDetails;
}

export type PaymentType = 'Startup Fee' | 'Per Patient' | 'Per Visit' | 'Milestone' | 'Monitoring Fee' | 'Closeout Fee' | 'Other';
export type PaymentMethod = 'Wire Transfer' | 'ACH' | 'Check' | 'Credit Card' | 'Other';

// Supporting entities
export interface MonitoringVisit extends BaseEntity {
  visitId: string;
  siteId: string;
  studyId: string;
  monitorName: string;
  visitDate: string;
  visitType: 'Initiation' | 'Routine' | 'Closeout' | 'For Cause';
  findings: string[];
  actionItems: ActionItem[];
  status: 'Planned' | 'Completed' | 'Cancelled';
  reportDate?: string;
}

export interface ActionItem extends BaseEntity {
  itemId: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignedTo: string;
  dueDate: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  resolution?: string;
}

export interface AdverseEvent extends BaseEntity {
  aeId: string;
  patientId: string;
  studyId: string;
  siteId: string;
  term: string;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Life-threatening' | 'Fatal';
  relationship: 'Unrelated' | 'Unlikely' | 'Possible' | 'Probable' | 'Definite';
  startDate: string;
  endDate?: string;
  ongoing: boolean;
  serious: boolean;
  reportedDate: string;
  reportedBy: string;
}

export interface ProtocolDeviation extends BaseEntity {
  deviationId: string;
  patientId: string;
  studyId: string;
  siteId: string;
  type: 'Major' | 'Minor';
  category: string;
  description: string;
  occurredDate: string;
  reportedDate: string;
  reportedBy: string;
  impact: 'None' | 'Low' | 'Medium' | 'High';
  correctionRequired: boolean;
  correctionDescription?: string;
  status: 'Open' | 'Under Review' | 'Resolved' | 'Closed';
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  swiftCode?: string;
  iban?: string;
  address: string;
}

// Enrollment data for analytics
export interface EnrollmentData {
  studyId: string;
  siteId?: string;
  date: string;
  cumulativeEnrollment: number;
  newEnrollments: number;
  targetEnrollment: number;
  enrollmentRate: number;
  projectedCompletion?: string;
}

// Financial snapshot for reporting
export interface FinancialSnapshot {
  studyId: string;
  siteId?: string;
  date: string;
  totalBudget: number;
  spentAmount: number;
  remainingBudget: number;
  burnRate: number; // Monthly spend rate
  projectedOverrun: number;
  paymentsPending: number;
  paymentsOverdue: number;
}

// Data versioning for audit trail
export interface DataVersion {
  entityType: string;
  entityId: string;
  version: number;
  timestamp: string;
  changes: FieldChange[];
  source: DataSource;
  userId: string;
  reason?: string;
}

export interface FieldChange {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'create' | 'update' | 'delete';
}

// Integration metadata
export interface IntegrationLog {
  id: string;
  source: string; // 'ctms', 'edc', 'erp', etc.
  studyId: string;
  timestamp: string;
  recordsProcessed: number;
  recordsSuccessful: number;
  recordsFailed: number;
  errors: IntegrationError[];
  status: 'Success' | 'Partial' | 'Failed';
  duration: number; // milliseconds
}

export interface IntegrationError {
  recordId: string;
  field?: string;
  error: string;
  severity: 'Warning' | 'Error' | 'Critical';
}

// Export all types for easy importing
export type {
  BaseEntity,
  Study,
  Site,
  Patient,
  PatientVisit,
  Budget,
  Payment,
  MonitoringVisit,
  ActionItem,
  AdverseEvent,
  ProtocolDeviation,
  BankDetails,
  EnrollmentData,
  FinancialSnapshot,
  DataVersion,
  FieldChange,
  IntegrationLog,
  IntegrationError,
};
