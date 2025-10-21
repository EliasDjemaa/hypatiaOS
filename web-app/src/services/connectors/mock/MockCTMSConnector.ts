/**
 * Mock CTMS Connector Implementation
 * 
 * Simulates Clinical Trial Management System integration with realistic
 * study management, site activation, and monitoring data.
 */

import {
  CTMSConnector,
  ConnectorHealth,
  ConnectorCredentials,
  FetchOptions,
  SiteActivationReport,
  BudgetUtilizationReport,
  StudyTimeline,
} from '../interfaces';
import {
  Study,
  Site,
  MonitoringVisit,
  StudyPhase,
  StudyStatus,
  SiteStatus,
} from '../../../types/schemas';

export class MockCTMSConnector implements CTMSConnector {
  readonly name = 'Mock CTMS Connector';
  readonly version = '1.0.0';
  readonly type = 'CTMS' as const;
  
  private connected = false;

  async connect(): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300));
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
    const latency = Math.random() * 80 + 40;
    return {
      status: this.connected ? 'healthy' : 'unhealthy',
      latency,
      lastCheck: new Date().toISOString(),
    };
  }

  async authenticate(credentials: ConnectorCredentials): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 150));
    return true;
  }

  async fetchStudyData(studyId: string, options?: FetchOptions): Promise<Study> {
    await this.simulateDelay();
    
    const phases: StudyPhase[] = ['Phase I', 'Phase II', 'Phase III', 'Phase IV'];
    const statuses: StudyStatus[] = ['Planned', 'Initiated', 'Recruiting', 'Active'];
    
    return {
      id: studyId,
      studyId,
      title: `${phases[Math.floor(Math.random() * phases.length)]} Clinical Trial - ${studyId}`,
      sponsor: this.randomSponsor(),
      therapeuticArea: this.randomTherapeuticArea(),
      phase: phases[Math.floor(Math.random() * phases.length)],
      targetEnrollment: 300 + Math.floor(Math.random() * 500),
      currentEnrollment: Math.floor(Math.random() * 200) + 50,
      enrollmentProgress: 0,
      sitesActivated: Math.floor(Math.random() * 8) + 2,
      totalSites: Math.floor(Math.random() * 5) + 10,
      startDate: '2024-01-15',
      plannedEndDate: '2025-06-30',
      status: statuses[Math.floor(Math.random() * statuses.length)],
      healthScore: Math.floor(Math.random() * 40) + 60,
      healthIndicator: this.calculateHealthIndicator(Math.floor(Math.random() * 40) + 60),
      currency: 'USD',
      estimatedBudget: 2500000 + Math.floor(Math.random() * 2000000),
      budgetUtilization: Math.floor(Math.random() * 60) + 20,
      lastDataSync: new Date().toISOString(),
      dataSource: 'ctms',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
      version: 1,
      createdBy: 'ctms-system',
      lastModifiedBy: 'ctms-system',
    };
  }

  async fetchAllStudies(options?: FetchOptions): Promise<Study[]> {
    await this.simulateDelay();
    
    const studyCount = 5 + Math.floor(Math.random() * 10);
    const studies: Study[] = [];
    
    for (let i = 1; i <= studyCount; i++) {
      const studyId = `STUDY-${String(i).padStart(3, '0')}`;
      studies.push(await this.fetchStudyData(studyId, options));
    }
    
    return this.applyFetchOptions(studies, options);
  }

  async updateStudyStatus(studyId: string, status: string): Promise<boolean> {
    await this.simulateDelay();
    // Mock successful update
    return true;
  }

  async fetchSiteData(studyId: string, siteId?: string, options?: FetchOptions): Promise<Site[]> {
    await this.simulateDelay();
    
    const siteCount = siteId ? 1 : Math.floor(Math.random() * 8) + 5;
    const sites: Site[] = [];
    
    for (let i = 1; i <= siteCount; i++) {
      const currentSiteId = siteId || `site-${i}`;
      const activationDate = this.randomDate(new Date('2024-01-01'), new Date());
      const status = this.randomSiteStatus();
      
      sites.push({
        id: currentSiteId,
        siteId: currentSiteId,
        studyId,
        siteName: this.randomSiteName(),
        country: this.randomCountry(),
        city: this.randomCity(),
        principalInvestigator: this.randomInvestigatorName(),
        piEmail: `pi${i}@site${i}.com`,
        piPhone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        coordinatorName: this.randomCoordinatorName(),
        coordinatorEmail: `coordinator${i}@site${i}.com`,
        status,
        activationDate: status !== 'Selected' ? activationDate.toISOString().split('T')[0] : undefined,
        firstPatientIn: status === 'Recruiting' || status === 'Completed' ? 
          this.addDays(activationDate, Math.floor(Math.random() * 30) + 14).toISOString().split('T')[0] : undefined,
        targetEnrollment: Math.floor(Math.random() * 30) + 20,
        currentEnrollment: Math.floor(Math.random() * 25) + 5,
        enrollmentRate: 1.5 + Math.random() * 2,
        completedVisits: Math.floor(Math.random() * 100) + 50,
        missedVisits: Math.floor(Math.random() * 10),
        protocolDeviations: Math.floor(Math.random() * 5),
        monitoringVisits: [],
        paymentStatus: this.randomPaymentStatus(),
        totalPayments: Math.floor(Math.random() * 500000) + 100000,
        outstandingPayments: Math.floor(Math.random() * 50000),
        createdAt: activationDate.toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
        createdBy: 'ctms-system',
        lastModifiedBy: 'ctms-system',
      });
    }
    
    return this.applyFetchOptions(sites, options);
  }

  async fetchSiteActivationStatus(studyId: string): Promise<SiteActivationReport> {
    await this.simulateDelay();
    
    const totalSites = Math.floor(Math.random() * 8) + 10;
    const activatedSites = Math.floor(totalSites * (0.6 + Math.random() * 0.3));
    
    return {
      studyId,
      totalSites,
      activatedSites,
      pendingSites: totalSites - activatedSites,
      activationTimeline: Array.from({ length: totalSites }, (_, i) => {
        const plannedDate = this.addDays(new Date('2024-01-01'), i * 14);
        const isActivated = i < activatedSites;
        
        return {
          siteId: `site-${i + 1}`,
          plannedActivation: plannedDate.toISOString().split('T')[0],
          actualActivation: isActivated ? 
            this.addDays(plannedDate, Math.floor(Math.random() * 14) - 7).toISOString().split('T')[0] : undefined,
          status: isActivated ? 'Activated' : 'Pending',
        };
      }),
    };
  }

  async updateSiteStatus(studyId: string, siteId: string, status: string): Promise<boolean> {
    await this.simulateDelay();
    return true;
  }

  async fetchMonitoringVisits(studyId: string, siteId?: string, options?: FetchOptions): Promise<MonitoringVisit[]> {
    await this.simulateDelay();
    
    const visitCount = Math.floor(Math.random() * 10) + 5;
    const visits: MonitoringVisit[] = [];
    
    for (let i = 1; i <= visitCount; i++) {
      const visitDate = this.randomDate(new Date('2024-01-01'), new Date());
      
      visits.push({
        id: `mv-${i}`,
        visitId: `MV${String(i).padStart(3, '0')}`,
        siteId: siteId || `site-${Math.floor(Math.random() * 5) + 1}`,
        studyId,
        monitorName: this.randomMonitorName(),
        visitDate: visitDate.toISOString().split('T')[0],
        visitType: this.randomVisitType(),
        findings: this.generateFindings(),
        actionItems: this.generateActionItems(),
        status: Math.random() < 0.8 ? 'Completed' : 'Planned',
        reportDate: Math.random() < 0.8 ? 
          this.addDays(visitDate, Math.floor(Math.random() * 7) + 1).toISOString().split('T')[0] : undefined,
        createdAt: visitDate.toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
        createdBy: 'ctms-system',
        lastModifiedBy: 'ctms-system',
      });
    }
    
    return this.applyFetchOptions(visits, options);
  }

  async scheduleMonitoringVisit(visit: Partial<MonitoringVisit>): Promise<string> {
    await this.simulateDelay();
    return `MV${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
  }

  async fetchBudgetUtilization(studyId: string): Promise<BudgetUtilizationReport> {
    await this.simulateDelay();
    
    const totalBudget = 2500000 + Math.floor(Math.random() * 2000000);
    const utilizedBudget = Math.floor(totalBudget * (0.3 + Math.random() * 0.4));
    
    const categories = [
      'Site Fees', 'Patient Fees', 'Monitoring', 'Laboratory', 'Drug Supply'
    ];
    
    return {
      studyId,
      totalBudget,
      utilizedBudget,
      utilizationPercentage: (utilizedBudget / totalBudget) * 100,
      budgetByCategory: categories.map(category => {
        const planned = Math.floor(totalBudget * (0.15 + Math.random() * 0.15));
        const actual = Math.floor(planned * (0.7 + Math.random() * 0.5));
        return {
          category,
          planned,
          actual,
          variance: actual - planned,
        };
      }),
      budgetBySite: Array.from({ length: 8 }, (_, i) => {
        const planned = Math.floor(totalBudget * 0.08 + Math.random() * totalBudget * 0.05);
        const actual = Math.floor(planned * (0.7 + Math.random() * 0.5));
        return {
          siteId: `site-${i + 1}`,
          planned,
          actual,
          variance: actual - planned,
        };
      }),
    };
  }

  async fetchStudyTimeline(studyId: string): Promise<StudyTimeline> {
    await this.simulateDelay();
    
    const milestones = [
      { name: 'Study Startup', plannedDate: '2024-01-15', status: 'Completed' as const },
      { name: 'First Site Activation', plannedDate: '2024-02-01', status: 'Completed' as const },
      { name: 'First Patient Enrolled', plannedDate: '2024-02-15', status: 'Completed' as const },
      { name: '50% Enrollment', plannedDate: '2024-06-01', status: 'In Progress' as const },
      { name: 'Last Patient In', plannedDate: '2024-10-01', status: 'Not Started' as const },
      { name: 'Last Patient Out', plannedDate: '2025-04-01', status: 'Not Started' as const },
      { name: 'Database Lock', plannedDate: '2025-05-01', status: 'Not Started' as const },
      { name: 'Study Report', plannedDate: '2025-06-30', status: 'Not Started' as const },
    ];
    
    return {
      studyId,
      milestones: milestones.map(milestone => ({
        ...milestone,
        actualDate: milestone.status === 'Completed' ? 
          this.addDays(new Date(milestone.plannedDate), Math.floor(Math.random() * 14) - 7).toISOString().split('T')[0] : 
          undefined,
        dependencies: [],
      })),
      criticalPath: ['Study Startup', 'First Site Activation', 'First Patient Enrolled', 'Last Patient In'],
      projectedCompletion: '2025-07-15',
    };
  }

  // Private helper methods
  private async simulateDelay(): Promise<void> {
    const delay = Math.random() * 400 + 100;
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

  private randomSponsor(): string {
    const sponsors = [
      'BioPharma Corp', 'MedTech Industries', 'Global Health Solutions',
      'Innovative Therapeutics', 'Advanced Medical Research', 'Clinical Innovations Inc'
    ];
    return sponsors[Math.floor(Math.random() * sponsors.length)];
  }

  private randomTherapeuticArea(): string {
    const areas = [
      'Oncology', 'Cardiology', 'Neurology', 'Endocrinology', 'Infectious Disease',
      'Respiratory', 'Gastroenterology', 'Dermatology', 'Ophthalmology', 'Rare Diseases'
    ];
    return areas[Math.floor(Math.random() * areas.length)];
  }

  private calculateHealthIndicator(score: number): 'excellent' | 'good' | 'warning' | 'critical' {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'warning';
    return 'critical';
  }

  private randomSiteStatus(): SiteStatus {
    const statuses: SiteStatus[] = ['Selected', 'Contracted', 'Initiated', 'Recruiting', 'Completed'];
    const weights = [0.1, 0.15, 0.2, 0.45, 0.1];
    return this.weightedRandom(statuses, weights);
  }

  private randomPaymentStatus(): 'Current' | 'Overdue' | 'Pending' | 'Suspended' {
    const statuses = ['Current', 'Overdue', 'Pending', 'Suspended'] as const;
    const weights = [0.6, 0.15, 0.2, 0.05];
    return this.weightedRandom(statuses, weights);
  }

  private randomSiteName(): string {
    const names = [
      'Metro Medical Center', 'Regional Research Institute', 'University Hospital',
      'Clinical Research Associates', 'Advanced Care Clinic', 'Medical Research Center',
      'Healthcare Innovation Hub', 'Specialized Treatment Center'
    ];
    return names[Math.floor(Math.random() * names.length)];
  }

  private randomCountry(): string {
    const countries = ['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Australia'];
    return countries[Math.floor(Math.random() * countries.length)];
  }

  private randomCity(): string {
    const cities = [
      'New York', 'Los Angeles', 'Chicago', 'Houston', 'Toronto', 'London',
      'Berlin', 'Paris', 'Sydney', 'Melbourne', 'Boston', 'San Francisco'
    ];
    return cities[Math.floor(Math.random() * cities.length)];
  }

  private randomInvestigatorName(): string {
    const firstNames = ['Dr. Sarah', 'Dr. Michael', 'Dr. Jennifer', 'Dr. David', 'Dr. Lisa', 'Dr. Robert'];
    const lastNames = ['Johnson', 'Smith', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore'];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  }

  private randomCoordinatorName(): string {
    const firstNames = ['Emily', 'James', 'Amanda', 'Christopher', 'Michelle', 'Daniel'];
    const lastNames = ['Anderson', 'Taylor', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson'];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  }

  private randomMonitorName(): string {
    const firstNames = ['Alex', 'Jordan', 'Casey', 'Morgan', 'Taylor', 'Jamie'];
    const lastNames = ['Rodriguez', 'Lee', 'Garcia', 'Martinez', 'Lopez', 'Gonzalez'];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  }

  private randomVisitType(): 'Initiation' | 'Routine' | 'Closeout' | 'For Cause' {
    const types = ['Initiation', 'Routine', 'Closeout', 'For Cause'] as const;
    const weights = [0.2, 0.6, 0.15, 0.05];
    return this.weightedRandom(types, weights);
  }

  private generateFindings(): string[] {
    const findings = [
      'Source data verification completed',
      'Minor protocol deviation noted',
      'Informed consent forms updated',
      'Laboratory results reviewed',
      'Adverse event documentation complete',
      'Site file organization improved',
    ];
    
    const count = Math.floor(Math.random() * 4) + 1;
    return findings.slice(0, count);
  }

  private generateActionItems(): any[] {
    const items = [
      'Update delegation log',
      'Complete source data verification',
      'Submit outstanding queries',
      'Schedule next monitoring visit',
    ];
    
    const count = Math.floor(Math.random() * 3);
    return items.slice(0, count).map((description, i) => ({
      id: `ai-${i + 1}`,
      itemId: `AI${String(i + 1).padStart(3, '0')}`,
      description,
      priority: 'Medium' as const,
      assignedTo: 'Site Coordinator',
      dueDate: this.addDays(new Date(), Math.floor(Math.random() * 14) + 7).toISOString().split('T')[0],
      status: 'Open' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      createdBy: 'monitor',
      lastModifiedBy: 'monitor',
    }));
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
