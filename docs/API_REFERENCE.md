# HypatiaOS API Reference

## Overview

This document provides comprehensive API reference for HypatiaOS's integration layer, including all connector interfaces, data services, and forecasting capabilities.

## Table of Contents

- [Data Service API](#data-service-api)
- [Connector Interfaces](#connector-interfaces)
- [Forecasting Service API](#forecasting-service-api)
- [Data Schemas](#data-schemas)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## Data Service API

The `DataService` provides a unified interface for accessing data from multiple sources.

### getInstance()

Returns the singleton instance of the DataService.

```typescript
static getInstance(): DataService
```

**Returns:** `DataService` - The singleton instance

**Example:**
```typescript
import { dataService } from '../services/DataService';
// or
import { DataService } from '../services/DataService';
const service = DataService.getInstance();
```

### getStudy(studyId)

Retrieves comprehensive study information with enriched data from multiple connectors.

```typescript
async getStudy(studyId: string): Promise<Study>
```

**Parameters:**
- `studyId` (string): The unique study identifier

**Returns:** `Promise<Study>` - Complete study object with enrollment and financial data

**Throws:** `Error` if study not found or connector fails

**Example:**
```typescript
const study = await dataService.getStudy('ONCOLOGY-2024-001');
console.log(`Study: ${study.title}`);
console.log(`Enrollment: ${study.currentEnrollment}/${study.targetEnrollment}`);
console.log(`Health Score: ${study.healthScore}%`);
```

### getAllStudies(options?)

Retrieves all studies with optional filtering and pagination.

```typescript
async getAllStudies(options?: FetchOptions): Promise<Study[]>
```

**Parameters:**
- `options` (FetchOptions, optional): Query options for filtering and pagination

**Returns:** `Promise<Study[]>` - Array of study objects

**Example:**
```typescript
// Get first 10 active studies
const studies = await dataService.getAllStudies({
  limit: 10,
  filters: { status: 'Active' }
});

// Get studies from specific date range
const recentStudies = await dataService.getAllStudies({
  startDate: '2024-01-01',
  endDate: '2024-12-31'
});
```

### getSites(studyId, options?)

Retrieves site information for a specific study.

```typescript
async getSites(studyId: string, options?: FetchOptions): Promise<Site[]>
```

**Parameters:**
- `studyId` (string): The study identifier
- `options` (FetchOptions, optional): Query options

**Returns:** `Promise<Site[]>` - Array of site objects

**Example:**
```typescript
const sites = await dataService.getSites('ONCOLOGY-2024-001');
const activeSites = sites.filter(site => site.status === 'Recruiting');
```

### getEnrollmentData(studyId, options?)

Retrieves enrollment trend data for analytics and forecasting.

```typescript
async getEnrollmentData(studyId: string, options?: FetchOptions): Promise<EnrollmentData[]>
```

**Parameters:**
- `studyId` (string): The study identifier
- `options` (FetchOptions, optional): Query options including date range

**Returns:** `Promise<EnrollmentData[]>` - Array of enrollment data points

**Example:**
```typescript
// Get last 30 days of enrollment data
const enrollmentData = await dataService.getEnrollmentData('ONCOLOGY-2024-001', {
  startDate: '2024-01-01',
  limit: 30
});

// Calculate enrollment velocity
const recentData = enrollmentData.slice(-7);
const weeklyEnrollment = recentData.reduce((sum, day) => sum + day.newEnrollments, 0);
```

### getPatients(studyId, options?)

Retrieves patient data for a study.

```typescript
async getPatients(studyId: string, options?: FetchOptions): Promise<Patient[]>
```

**Parameters:**
- `studyId` (string): The study identifier
- `options` (FetchOptions, optional): Query options

**Returns:** `Promise<Patient[]>` - Array of patient objects

**Example:**
```typescript
const patients = await dataService.getPatients('ONCOLOGY-2024-001');
const activePatients = patients.filter(p => p.status === 'Active');
```

### getBudgets(studyId, options?)

Retrieves budget information for financial analysis.

```typescript
async getBudgets(studyId: string, options?: FetchOptions): Promise<Budget[]>
```

**Parameters:**
- `studyId` (string): The study identifier
- `options` (FetchOptions, optional): Query options

**Returns:** `Promise<Budget[]>` - Array of budget objects

**Example:**
```typescript
const budgets = await dataService.getBudgets('ONCOLOGY-2024-001');
const totalPlanned = budgets.reduce((sum, b) => sum + b.plannedAmount, 0);
const totalActual = budgets.reduce((sum, b) => sum + b.actualAmount, 0);
const variance = totalActual - totalPlanned;
```

### getPayments(studyId, siteId?, options?)

Retrieves payment records for financial tracking.

```typescript
async getPayments(studyId: string, siteId?: string, options?: FetchOptions): Promise<Payment[]>
```

**Parameters:**
- `studyId` (string): The study identifier
- `siteId` (string, optional): Filter by specific site
- `options` (FetchOptions, optional): Query options

**Returns:** `Promise<Payment[]>` - Array of payment objects

**Example:**
```typescript
// Get all payments for study
const allPayments = await dataService.getPayments('ONCOLOGY-2024-001');

// Get payments for specific site
const sitePayments = await dataService.getPayments('ONCOLOGY-2024-001', 'site-001');

// Get overdue payments
const overduePayments = allPayments.filter(p => p.status === 'Overdue');
```

### getFinancialSnapshot(studyId)

Retrieves current financial status summary.

```typescript
async getFinancialSnapshot(studyId: string): Promise<FinancialSnapshot>
```

**Parameters:**
- `studyId` (string): The study identifier

**Returns:** `Promise<FinancialSnapshot>` - Financial summary object

**Example:**
```typescript
const snapshot = await dataService.getFinancialSnapshot('ONCOLOGY-2024-001');
console.log(`Budget utilization: ${(snapshot.spentAmount / snapshot.totalBudget * 100).toFixed(1)}%`);
console.log(`Burn rate: $${(snapshot.burnRate / 1000).toFixed(0)}K/month`);
```

### getDashboardData(studyId?)

Retrieves aggregated dashboard metrics.

```typescript
async getDashboardData(studyId?: string): Promise<DashboardData>
```

**Parameters:**
- `studyId` (string, optional): Specific study or all studies if omitted

**Returns:** `Promise<DashboardData>` - Dashboard metrics object

**Example:**
```typescript
// Get dashboard for all studies
const dashboard = await dataService.getDashboardData();

// Get dashboard for specific study
const studyDashboard = await dataService.getDashboardData('ONCOLOGY-2024-001');

console.log(`Total studies: ${dashboard.totalStudies}`);
console.log(`Active studies: ${dashboard.activeStudies}`);
console.log(`Enrollment progress: ${dashboard.totalEnrollment}/${dashboard.targetEnrollment}`);
```

### subscribeToEnrollmentUpdates(studyId, callback)

Subscribes to real-time enrollment updates.

```typescript
async subscribeToEnrollmentUpdates(studyId: string, callback: (data: EnrollmentData) => void): Promise<string>
```

**Parameters:**
- `studyId` (string): The study identifier
- `callback` (function): Function to call when new data arrives

**Returns:** `Promise<string>` - Subscription ID for unsubscribing

**Example:**
```typescript
const subscriptionId = await dataService.subscribeToEnrollmentUpdates(
  'ONCOLOGY-2024-001',
  (newData) => {
    console.log('New enrollment:', newData.newEnrollments);
    updateUI(newData);
  }
);

// Unsubscribe when component unmounts
await dataService.unsubscribeFromUpdates(subscriptionId);
```

### importStudyData(studyId, data, source)

Imports external data into the system.

```typescript
async importStudyData(studyId: string, data: any, source: string): Promise<IntegrationLog>
```

**Parameters:**
- `studyId` (string): The study identifier
- `data` (any): Data to import (array or object)
- `source` (string): Source identifier for tracking

**Returns:** `Promise<IntegrationLog>` - Import result log

**Example:**
```typescript
const enrollmentData = [
  { date: '2024-01-15', site_id: 'site-001', new_enrollments: 3 },
  { date: '2024-01-16', site_id: 'site-002', new_enrollments: 2 },
];

const result = await dataService.importStudyData(
  'ONCOLOGY-2024-001',
  enrollmentData,
  'csv-import'
);

console.log(`Imported ${result.recordsSuccessful} records`);
if (result.recordsFailed > 0) {
  console.error('Import errors:', result.errors);
}
```

### getSystemHealth()

Retrieves system health status and connector information.

```typescript
async getSystemHealth(): Promise<SystemHealth>
```

**Returns:** `Promise<SystemHealth>` - System health status

**Example:**
```typescript
const health = await dataService.getSystemHealth();

if (health.overall !== 'healthy') {
  console.warn('System issues detected');
  Object.entries(health.connectors || {}).forEach(([name, status]) => {
    if (status.status !== 'healthy') {
      console.error(`${name} connector: ${status.status}`);
    }
  });
}
```

## Connector Interfaces

### BaseConnector

All connectors implement this base interface.

#### connect()

Establishes connection to the external system.

```typescript
async connect(): Promise<boolean>
```

**Returns:** `Promise<boolean>` - True if connection successful

#### disconnect()

Closes connection to the external system.

```typescript
async disconnect(): Promise<void>
```

#### isConnected()

Checks current connection status.

```typescript
isConnected(): boolean
```

**Returns:** `boolean` - Current connection status

#### healthCheck()

Performs health check on the connection.

```typescript
async healthCheck(): Promise<ConnectorHealth>
```

**Returns:** `Promise<ConnectorHealth>` - Health status object

#### authenticate(credentials)

Authenticates with the external system.

```typescript
async authenticate(credentials: ConnectorCredentials): Promise<boolean>
```

**Parameters:**
- `credentials` (ConnectorCredentials): Authentication credentials

**Returns:** `Promise<boolean>` - True if authentication successful

### EDCConnector

Electronic Data Capture system connector.

#### fetchEnrollmentData(studyId, options?)

```typescript
async fetchEnrollmentData(studyId: string, options?: FetchOptions): Promise<EnrollmentData[]>
```

#### fetchPatientData(studyId, options?)

```typescript
async fetchPatientData(studyId: string, options?: FetchOptions): Promise<Patient[]>
```

#### fetchPatientVisitData(studyId, patientId?, options?)

```typescript
async fetchPatientVisitData(studyId: string, patientId?: string, options?: FetchOptions): Promise<PatientVisit[]>
```

#### getDataCompleteness(studyId)

```typescript
async getDataCompleteness(studyId: string): Promise<DataCompletenessReport>
```

### CTMSConnector

Clinical Trial Management System connector.

#### fetchStudyData(studyId, options?)

```typescript
async fetchStudyData(studyId: string, options?: FetchOptions): Promise<Study>
```

#### fetchSiteData(studyId, siteId?, options?)

```typescript
async fetchSiteData(studyId: string, siteId?: string, options?: FetchOptions): Promise<Site[]>
```

#### fetchBudgetUtilization(studyId)

```typescript
async fetchBudgetUtilization(studyId: string): Promise<BudgetUtilizationReport>
```

### ERPConnector

Enterprise Resource Planning system connector.

#### fetchBudgetData(studyId, options?)

```typescript
async fetchBudgetData(studyId: string, options?: FetchOptions): Promise<Budget[]>
```

#### fetchPaymentData(studyId, siteId?, options?)

```typescript
async fetchPaymentData(studyId: string, siteId?: string, options?: FetchOptions): Promise<Payment[]>
```

#### processPayment(payment)

```typescript
async processPayment(payment: Partial<Payment>): Promise<string>
```

## Forecasting Service API

The `ForecastingService` provides AI-powered predictive analytics.

### getInstance()

Returns the singleton instance of the ForecastingService.

```typescript
static getInstance(): ForecastingService
```

### forecastEnrollment(studyId, horizon?)

Generates enrollment predictions using machine learning models.

```typescript
async forecastEnrollment(studyId: string, horizon?: number): Promise<EnrollmentForecast>
```

**Parameters:**
- `studyId` (string): The study identifier
- `horizon` (number, optional): Forecast horizon in days (default: 90)

**Returns:** `Promise<EnrollmentForecast>` - Enrollment forecast object

**Example:**
```typescript
import { forecastingService } from '../services/ForecastingService';

const forecast = await forecastingService.forecastEnrollment('ONCOLOGY-2024-001', 120);

console.log('Completion date:', forecast.completionDate);
console.log('Forecast accuracy:', forecast.accuracy);

forecast.predictions.forEach(prediction => {
  console.log(`${prediction.date}: ${prediction.predictedEnrollment} patients (${(prediction.confidence * 100).toFixed(0)}% confidence)`);
});

forecast.recommendations.forEach(rec => {
  console.log('Recommendation:', rec);
});
```

### forecastBudget(studyId, horizon?)

Generates budget and spend predictions.

```typescript
async forecastBudget(studyId: string, horizon?: number): Promise<BudgetForecast>
```

**Parameters:**
- `studyId` (string): The study identifier
- `horizon` (number, optional): Forecast horizon in months (default: 12)

**Returns:** `Promise<BudgetForecast>` - Budget forecast object

**Example:**
```typescript
const budgetForecast = await forecastingService.forecastBudget('ONCOLOGY-2024-001', 6);

console.log('Risk level:', budgetForecast.riskLevel);
console.log('Projected overrun:', budgetForecast.projectedOverrun);

if (budgetForecast.riskLevel === 'High' || budgetForecast.riskLevel === 'Critical') {
  budgetForecast.recommendations.forEach(rec => {
    console.warn('Budget recommendation:', rec);
  });
}
```

### forecastTimeline(studyId)

Generates timeline and milestone predictions.

```typescript
async forecastTimeline(studyId: string): Promise<TimelineForecast>
```

**Parameters:**
- `studyId` (string): The study identifier

**Returns:** `Promise<TimelineForecast>` - Timeline forecast object

**Example:**
```typescript
const timelineForecast = await forecastingService.forecastTimeline('ONCOLOGY-2024-001');

console.log('Overall delay:', timelineForecast.overallDelay, 'days');

timelineForecast.milestones.forEach(milestone => {
  const delay = new Date(milestone.predictedDate).getTime() - new Date(milestone.originalDate).getTime();
  const delayDays = Math.round(delay / (1000 * 60 * 60 * 24));
  
  console.log(`${milestone.name}: ${delayDays > 0 ? '+' : ''}${delayDays} days`);
  
  if (milestone.criticalPath && milestone.delayRisk > 0.7) {
    console.warn(`High delay risk for critical milestone: ${milestone.name}`);
  }
});
```

### getModelMetrics(modelType)

Retrieves performance metrics for ML models.

```typescript
async getModelMetrics(modelType: string): Promise<ModelMetrics | null>
```

**Parameters:**
- `modelType` (string): Type of model ('enrollment', 'budget', 'timeline')

**Returns:** `Promise<ModelMetrics | null>` - Model performance metrics

**Example:**
```typescript
const enrollmentMetrics = await forecastingService.getModelMetrics('enrollment');

if (enrollmentMetrics) {
  console.log(`Model accuracy: ${(enrollmentMetrics.accuracy * 100).toFixed(1)}%`);
  console.log(`Last trained: ${new Date(enrollmentMetrics.lastTrained).toLocaleDateString()}`);
  console.log(`Training data size: ${enrollmentMetrics.trainingDataSize} records`);
}
```

## Data Schemas

### FetchOptions

Common options for data fetching operations.

```typescript
interface FetchOptions {
  startDate?: string;        // ISO date string
  endDate?: string;          // ISO date string
  limit?: number;            // Maximum records to return
  offset?: number;           // Records to skip (pagination)
  includeInactive?: boolean; // Include inactive records
  fields?: string[];         // Specific fields to return
  filters?: Record<string, any>; // Additional filters
}
```

### Study

Core study entity with comprehensive information.

```typescript
interface Study {
  id: string;
  studyId: string;           // Protocol identifier
  title: string;
  sponsor: string;
  therapeuticArea: string;
  phase: StudyPhase;
  targetEnrollment: number;
  currentEnrollment: number;
  enrollmentProgress: number; // Percentage
  sitesActivated: number;
  totalSites: number;
  startDate: string;
  plannedEndDate: string;
  actualEndDate?: string;
  status: StudyStatus;
  healthScore: number;        // 0-100
  healthIndicator: 'excellent' | 'good' | 'warning' | 'critical';
  currency: string;
  estimatedBudget: number;
  actualBudget?: number;
  budgetUtilization: number;  // Percentage
  lastDataSync?: string;
  dataSource: DataSource;
  // Base entity fields
  createdAt: string;
  updatedAt: string;
  version: number;
  createdBy: string;
  lastModifiedBy: string;
}
```

### EnrollmentData

Enrollment trend data for analytics.

```typescript
interface EnrollmentData {
  studyId: string;
  siteId?: string;           // Optional site-specific data
  date: string;              // ISO date string
  cumulativeEnrollment: number;
  newEnrollments: number;
  targetEnrollment: number;
  enrollmentRate: number;    // Patients per month
  projectedCompletion?: string;
}
```

### DashboardData

Aggregated metrics for dashboard display.

```typescript
interface DashboardData {
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
```

### EnrollmentForecast

AI-generated enrollment predictions.

```typescript
interface EnrollmentForecast {
  studyId: string;
  forecastDate: string;
  predictions: Array<{
    date: string;
    predictedEnrollment: number;
    confidence: number;      // 0-1
    lowerBound: number;
    upperBound: number;
  }>;
  completionDate: string;
  accuracy: number;          // Model accuracy 0-1
  factors: ForecastFactor[];
  recommendations: string[];
}
```

## Error Handling

### Error Types

All API methods may throw the following error types:

#### ConnectionError

Thrown when connector cannot establish connection.

```typescript
class ConnectionError extends Error {
  constructor(message: string, public connectorType: string) {
    super(message);
    this.name = 'ConnectionError';
  }
}
```

#### AuthenticationError

Thrown when authentication fails.

```typescript
class AuthenticationError extends Error {
  constructor(message: string, public connectorType: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}
```

#### DataValidationError

Thrown when data validation fails.

```typescript
class DataValidationError extends Error {
  constructor(message: string, public validationErrors: ValidationError[]) {
    super(message);
    this.name = 'DataValidationError';
  }
}
```

### Error Handling Examples

```typescript
try {
  const study = await dataService.getStudy('INVALID-STUDY');
} catch (error) {
  if (error instanceof ConnectionError) {
    console.error('Connection failed:', error.connectorType);
  } else if (error instanceof AuthenticationError) {
    console.error('Authentication failed:', error.connectorType);
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

## Rate Limiting

### Default Limits

- **EDC Connectors**: 100 requests/minute
- **CTMS Connectors**: 60 requests/minute  
- **ERP Connectors**: 30 requests/minute
- **Forecasting Service**: 10 requests/minute

### Rate Limit Headers

API responses include rate limit information:

```typescript
interface RateLimitInfo {
  limit: number;           // Requests per window
  remaining: number;       // Remaining requests
  reset: number;          // Reset time (Unix timestamp)
  retryAfter?: number;    // Seconds to wait if rate limited
}
```

### Handling Rate Limits

```typescript
import { dataService } from '../services/DataService';

const fetchWithRetry = async (studyId: string, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await dataService.getStudy(studyId);
    } catch (error) {
      if (error.name === 'RateLimitError' && attempt < maxRetries) {
        const delay = error.retryAfter * 1000 || 1000 * attempt;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
};
```

## Versioning

The API uses semantic versioning. Current version: **v1.0.0**

### Version Headers

Include version in requests:

```typescript
const connector = connectorFactory.createEDCConnector('veeva', {
  apiKey: 'your-key',
  endpoint: 'https://api.example.com/v1',
  additionalParams: {
    'API-Version': '1.0.0'
  }
});
```

### Backward Compatibility

- **Major versions** (v1.x.x → v2.x.x): Breaking changes
- **Minor versions** (v1.0.x → v1.1.x): New features, backward compatible
- **Patch versions** (v1.0.0 → v1.0.1): Bug fixes, backward compatible

---

This API reference provides comprehensive documentation for integrating with HypatiaOS. For additional examples and tutorials, see the [Integration Guide](./INTEGRATION_GUIDE.md).
