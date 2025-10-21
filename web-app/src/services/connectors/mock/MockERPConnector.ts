/**
 * Mock ERP Connector Implementation
 * 
 * Simulates Enterprise Resource Planning system integration with realistic
 * financial data, budget tracking, and payment processing.
 */

import {
  ERPConnector,
  ConnectorHealth,
  ConnectorCredentials,
  FetchOptions,
  DateRange,
  InvoiceItem,
  SpendAnalysis,
  BurnRateAnalysis,
  ForecastAccuracy,
} from '../interfaces';
import {
  Budget,
  Payment,
  FinancialSnapshot,
  BudgetType,
  BudgetCategory,
  ApprovalStatus,
  PaymentType,
  PaymentStatus,
  PaymentMethod,
} from '../../../types/schemas';

export class MockERPConnector implements ERPConnector {
  readonly name = 'Mock ERP Connector';
  readonly version = '1.0.0';
  readonly type = 'ERP' as const;
  
  private connected = false;

  async connect(): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 400));
    this.connected = true;
    return true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async healthCheck(): Promise<ConnectorHealth> {
    const latency = Math.random() * 120 + 60;
    return {
      status: this.connected ? 'healthy' : 'unhealthy',
      latency,
      lastCheck: new Date().toISOString(),
    };
  }

  async authenticate(credentials: ConnectorCredentials): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 250));
    return true;
  }

  async fetchBudgetData(studyId: string, options?: FetchOptions): Promise<Budget[]> {
    await this.simulateDelay();
    
    const budgets: Budget[] = [];
    const categories: BudgetCategory[] = [
      'Site Fees', 'Patient Fees', 'Monitoring', 'Laboratory', 'Imaging', 'Drug Supply'
    ];
    
    // Generate study-level budgets
    for (const category of categories) {
      const plannedAmount = this.generateBudgetAmount(category);
      const actualAmount = plannedAmount * (0.7 + Math.random() * 0.5);
      
      budgets.push({
        id: `budget-${studyId}-${category.toLowerCase().replace(/\s+/g, '-')}`,
        budgetId: `BUD-${studyId}-${category.substring(0, 3).toUpperCase()}`,
        studyId,
        budgetType: 'Study Level',
        category,
        plannedAmount,
        actualAmount,
        variance: actualAmount - plannedAmount,
        variancePercentage: ((actualAmount - plannedAmount) / plannedAmount) * 100,
        currency: 'USD',
        fiscalYear: '2024',
        quarter: this.getCurrentQuarter(),
        approvalStatus: this.randomApprovalStatus(),
        approvedBy: Math.random() < 0.8 ? 'Finance Manager' : undefined,
        approvedDate: Math.random() < 0.8 ? this.randomDate(new Date('2024-01-01'), new Date()).toISOString().split('T')[0] : undefined,
        notes: Math.random() < 0.3 ? 'Budget adjustment approved due to scope change' : undefined,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: new Date().toISOString(),
        version: 1,
        createdBy: 'erp-system',
        lastModifiedBy: 'erp-system',
      });
    }
    
    // Generate site-level budgets
    const siteCount = Math.floor(Math.random() * 5) + 3;
    for (let i = 1; i <= siteCount; i++) {
      const siteId = `site-${i}`;
      const plannedAmount = 150000 + Math.random() * 100000;
      const actualAmount = plannedAmount * (0.6 + Math.random() * 0.6);
      
      budgets.push({
        id: `budget-${studyId}-${siteId}`,
        budgetId: `BUD-${studyId}-${siteId.toUpperCase()}`,
        studyId,
        siteId,
        budgetType: 'Site Level',
        category: 'Site Fees',
        plannedAmount,
        actualAmount,
        variance: actualAmount - plannedAmount,
        variancePercentage: ((actualAmount - plannedAmount) / plannedAmount) * 100,
        currency: 'USD',
        fiscalYear: '2024',
        quarter: this.getCurrentQuarter(),
        approvalStatus: 'Approved',
        approvedBy: 'Site Manager',
        approvedDate: this.randomDate(new Date('2024-01-01'), new Date()).toISOString().split('T')[0],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: new Date().toISOString(),
        version: 1,
        createdBy: 'erp-system',
        lastModifiedBy: 'erp-system',
      });
    }
    
    return this.applyFetchOptions(budgets, options);
  }

  async fetchPaymentData(studyId: string, siteId?: string, options?: FetchOptions): Promise<Payment[]> {
    await this.simulateDelay();
    
    const payments: Payment[] = [];
    const paymentCount = Math.floor(Math.random() * 20) + 10;
    
    for (let i = 1; i <= paymentCount; i++) {
      const dueDate = this.randomDate(new Date('2024-01-01'), new Date('2024-12-31'));
      const isPaid = Math.random() < 0.7;
      const currentSiteId = siteId || `site-${Math.floor(Math.random() * 8) + 1}`;
      
      payments.push({
        id: `payment-${i}`,
        paymentId: `PAY-${studyId}-${String(i).padStart(4, '0')}`,
        studyId,
        siteId: currentSiteId,
        invoiceId: `INV-${studyId}-${String(i).padStart(4, '0')}`,
        paymentType: this.randomPaymentType(),
        amount: this.generatePaymentAmount(),
        currency: 'USD',
        dueDate: dueDate.toISOString().split('T')[0],
        paidDate: isPaid ? this.addDays(dueDate, Math.floor(Math.random() * 14) - 7).toISOString().split('T')[0] : undefined,
        status: this.determinePaymentStatus(dueDate, isPaid),
        method: isPaid ? this.randomPaymentMethod() : undefined,
        reference: isPaid ? `REF${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}` : undefined,
        description: this.generatePaymentDescription(),
        milestoneId: Math.random() < 0.4 ? `MS-${Math.floor(Math.random() * 10) + 1}` : undefined,
        patientCount: Math.random() < 0.6 ? Math.floor(Math.random() * 20) + 1 : undefined,
        visitCount: Math.random() < 0.4 ? Math.floor(Math.random() * 50) + 10 : undefined,
        approvedBy: isPaid ? 'Finance Director' : undefined,
        processedBy: isPaid ? 'Accounts Payable' : undefined,
        bankDetails: isPaid ? this.generateBankDetails() : undefined,
        createdAt: dueDate.toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
        createdBy: 'erp-system',
        lastModifiedBy: 'erp-system',
      });
    }
    
    return this.applyFetchOptions(payments, options);
  }

  async fetchFinancialSnapshot(studyId: string, date?: string): Promise<FinancialSnapshot> {
    await this.simulateDelay();
    
    const totalBudget = 2500000 + Math.random() * 2000000;
    const spentAmount = totalBudget * (0.3 + Math.random() * 0.4);
    const burnRate = spentAmount / 8; // Assuming 8 months of activity
    
    return {
      studyId,
      date: date || new Date().toISOString().split('T')[0],
      totalBudget,
      spentAmount,
      remainingBudget: totalBudget - spentAmount,
      burnRate,
      projectedOverrun: Math.random() < 0.3 ? Math.random() * 200000 : 0,
      paymentsPending: Math.floor(Math.random() * 500000) + 100000,
      paymentsOverdue: Math.floor(Math.random() * 100000),
    };
  }

  async processPayment(payment: Partial<Payment>): Promise<string> {
    await this.simulateDelay(1000, 2000); // Longer delay for processing
    
    // Simulate payment processing
    const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    return paymentId;
  }

  async approvePayment(paymentId: string, approverId: string): Promise<boolean> {
    await this.simulateDelay();
    
    // Mock approval process
    return Math.random() < 0.95; // 95% success rate
  }

  async generateInvoice(studyId: string, siteId: string, items: InvoiceItem[]): Promise<string> {
    await this.simulateDelay(800, 1500);
    
    const invoiceId = `INV-${studyId}-${siteId}-${Date.now()}`;
    return invoiceId;
  }

  async getSpendAnalysis(studyId: string, period: DateRange): Promise<SpendAnalysis> {
    await this.simulateDelay();
    
    const totalSpend = Math.floor(Math.random() * 1000000) + 500000;
    const categories = ['Site Fees', 'Patient Fees', 'Monitoring', 'Laboratory', 'Drug Supply'];
    
    return {
      studyId,
      period,
      totalSpend,
      spendByCategory: categories.map(category => {
        const amount = totalSpend * (0.1 + Math.random() * 0.3);
        return {
          category,
          amount,
          percentage: (amount / totalSpend) * 100,
        };
      }),
      spendBySite: Array.from({ length: 8 }, (_, i) => {
        const amount = totalSpend * (0.08 + Math.random() * 0.1);
        return {
          siteId: `site-${i + 1}`,
          amount,
          percentage: (amount / totalSpend) * 100,
        };
      }),
      trends: this.generateSpendTrends(period),
    };
  }

  async getBurnRateAnalysis(studyId: string): Promise<BurnRateAnalysis> {
    await this.simulateDelay();
    
    const currentBurnRate = 200000 + Math.random() * 100000;
    const projectedBurnRate = currentBurnRate * (0.9 + Math.random() * 0.2);
    const totalBudget = 2500000;
    const spentAmount = currentBurnRate * 8;
    
    return {
      studyId,
      currentBurnRate,
      projectedBurnRate,
      budgetRunwayMonths: (totalBudget - spentAmount) / projectedBurnRate,
      burnRateHistory: this.generateBurnRateHistory(),
    };
  }

  async getForecastAccuracy(studyId: string): Promise<ForecastAccuracy> {
    await this.simulateDelay();
    
    return {
      studyId,
      enrollmentAccuracy: 75 + Math.random() * 20,
      budgetAccuracy: 80 + Math.random() * 15,
      timelineAccuracy: 70 + Math.random() * 25,
      historicalForecasts: this.generateHistoricalForecasts(),
    };
  }

  // Private helper methods
  private async simulateDelay(min: number = 200, max: number = 600): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private applyFetchOptions<T>(data: T[], options?: FetchOptions): T[] {
    if (!options) return data;
    
    let result = [...data];
    
    if (options.limit) {
      const offset = options.offset || 0;
      result = result.slice(offset, offset + options.limit);
    }
    
    return result;
  }

  private randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private getCurrentQuarter(): string {
    const month = new Date().getMonth() + 1;
    if (month <= 3) return 'Q1';
    if (month <= 6) return 'Q2';
    if (month <= 9) return 'Q3';
    return 'Q4';
  }

  private generateBudgetAmount(category: BudgetCategory): number {
    const baseBudgets = {
      'Site Fees': 800000,
      'Patient Fees': 600000,
      'Monitoring': 300000,
      'Laboratory': 400000,
      'Imaging': 200000,
      'Drug Supply': 500000,
      'Other': 100000,
    };
    
    const base = baseBudgets[category] || 100000;
    return base + (Math.random() * base * 0.5);
  }

  private randomApprovalStatus(): ApprovalStatus {
    const statuses: ApprovalStatus[] = ['Draft', 'Pending', 'Approved', 'Rejected'];
    const weights = [0.1, 0.2, 0.65, 0.05];
    return this.weightedRandom(statuses, weights);
  }

  private randomPaymentType(): PaymentType {
    const types: PaymentType[] = ['Startup Fee', 'Per Patient', 'Per Visit', 'Milestone', 'Monitoring Fee', 'Closeout Fee'];
    const weights = [0.1, 0.3, 0.25, 0.2, 0.1, 0.05];
    return this.weightedRandom(types, weights);
  }

  private randomPaymentMethod(): PaymentMethod {
    const methods: PaymentMethod[] = ['Wire Transfer', 'ACH', 'Check', 'Credit Card'];
    const weights = [0.5, 0.3, 0.15, 0.05];
    return this.weightedRandom(methods, weights);
  }

  private generatePaymentAmount(): number {
    const baseAmounts = {
      'Startup Fee': 50000,
      'Per Patient': 2500,
      'Per Visit': 500,
      'Milestone': 25000,
      'Monitoring Fee': 15000,
      'Closeout Fee': 20000,
    };
    
    const base = baseAmounts['Per Patient']; // Default
    return base + (Math.random() * base * 0.8);
  }

  private determinePaymentStatus(dueDate: Date, isPaid: boolean): PaymentStatus {
    if (isPaid) return 'Current';
    
    const now = new Date();
    const daysPastDue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysPastDue > 30) return 'Overdue';
    if (daysPastDue > 0) return 'Overdue';
    return 'Pending';
  }

  private generatePaymentDescription(): string {
    const descriptions = [
      'Site initiation fee payment',
      'Per-patient enrollment payment',
      'Monitoring visit fee',
      'Laboratory services payment',
      'Milestone achievement payment',
      'Study closeout payment',
      'Protocol amendment fee',
      'Data management services',
    ];
    
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  private generateBankDetails() {
    return {
      bankName: 'First National Bank',
      accountNumber: `****${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      routingNumber: '021000021',
      swiftCode: 'FNBKUS33',
      address: '123 Banking Street, New York, NY 10001',
    };
  }

  private generateSpendTrends(period: DateRange): Array<{ month: string; amount: number }> {
    const startDate = new Date(period.startDate);
    const endDate = new Date(period.endDate);
    const trends = [];
    
    for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {
      trends.push({
        month: d.toISOString().substring(0, 7), // YYYY-MM format
        amount: Math.floor(Math.random() * 200000) + 100000,
      });
    }
    
    return trends;
  }

  private generateBurnRateHistory(): Array<{ month: string; burnRate: number }> {
    const history = [];
    const baseRate = 200000;
    
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      history.unshift({
        month: date.toISOString().substring(0, 7),
        burnRate: baseRate + (Math.random() * 100000) - 50000,
      });
    }
    
    return history;
  }

  private generateHistoricalForecasts(): Array<{
    forecastDate: string;
    metric: string;
    predicted: number;
    actual: number;
    accuracy: number;
  }> {
    const forecasts = [];
    const metrics = ['Enrollment', 'Budget', 'Timeline'];
    
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      for (const metric of metrics) {
        const predicted = Math.random() * 1000000;
        const actual = predicted * (0.8 + Math.random() * 0.4);
        const accuracy = Math.min(100, (1 - Math.abs(predicted - actual) / predicted) * 100);
        
        forecasts.push({
          forecastDate: date.toISOString().split('T')[0],
          metric,
          predicted,
          actual,
          accuracy,
        });
      }
    }
    
    return forecasts;
  }

  private weightedRandom<T>(items: readonly T[], weights: number[]): T {
    const random = Math.random();
    let sum = 0;
    
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
      if (random <= sum) {
        return items[i];
      }
    }
    
    return items[items.length - 1];
  }
}
