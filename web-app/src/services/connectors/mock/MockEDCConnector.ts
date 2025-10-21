/**
 * Mock EDC Connector Implementation
 * 
 * Simulates Electronic Data Capture system integration with realistic data
 * and real-time updates. This allows frontend development to proceed while
 * waiting for actual EDC API access.
 */

import {
  EDCConnector,
  ConnectorHealth,
  ConnectorCredentials,
  FetchOptions,
  DataCompletenessReport,
  QueryMetrics,
} from '../interfaces';
import {
  EnrollmentData,
  Patient,
  PatientVisit,
  AdverseEvent,
  ProtocolDeviation,
  PatientStatus,
  VisitStatus,
  SDVStatus,
} from '../../../types/schemas';

export class MockEDCConnector implements EDCConnector {
  readonly name = 'Mock EDC Connector';
  readonly version = '1.0.0';
  readonly type = 'EDC' as const;
  
  private connected = false;
  private subscriptions = new Map<string, (data: EnrollmentData) => void>();
  private simulationInterval?: NodeJS.Timeout;

  async connect(): Promise<boolean> {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 500));
    this.connected = true;
    this.startSimulation();
    return true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.stopSimulation();
    this.subscriptions.clear();
  }

  isConnected(): boolean {
    return this.connected;
  }

  async healthCheck(): Promise<ConnectorHealth> {
    const latency = Math.random() * 100 + 50; // 50-150ms
    return {
      status: this.connected ? 'healthy' : 'unhealthy',
      latency,
      lastCheck: new Date().toISOString(),
    };
  }

  async authenticate(credentials: ConnectorCredentials): Promise<boolean> {
    // Mock authentication - always succeeds for demo
    await new Promise(resolve => setTimeout(resolve, 200));
    return true;
  }

  async fetchEnrollmentData(studyId: string, options?: FetchOptions): Promise<EnrollmentData[]> {
    await this.simulateDelay();
    
    const data: EnrollmentData[] = [];
    const startDate = new Date('2024-01-01');
    const endDate = new Date();
    
    // Generate daily enrollment data
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const daysSinceStart = Math.floor((d.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const baseEnrollment = Math.floor(daysSinceStart * 0.8 + Math.random() * 3);
      
      data.push({
        studyId,
        date: d.toISOString().split('T')[0],
        cumulativeEnrollment: Math.min(baseEnrollment, 500),
        newEnrollments: Math.random() < 0.3 ? Math.floor(Math.random() * 3) : 0,
        targetEnrollment: 500,
        enrollmentRate: 2.5 + Math.random() * 1.5,
        projectedCompletion: '2024-12-31',
      });
    }
    
    return this.applyFetchOptions(data, options);
  }

  async fetchPatientData(studyId: string, options?: FetchOptions): Promise<Patient[]> {
    await this.simulateDelay();
    
    const patients: Patient[] = [];
    const patientCount = 150 + Math.floor(Math.random() * 100);
    
    for (let i = 1; i <= patientCount; i++) {
      const enrollmentDate = this.randomDate(new Date('2024-01-01'), new Date());
      const status = this.randomPatientStatus();
      
      patients.push({
        id: `patient-${i}`,
        patientId: `P${studyId}-${String(i).padStart(4, '0')}`,
        studyId,
        siteId: `site-${Math.floor(Math.random() * 10) + 1}`,
        screeningNumber: `SCR${String(i).padStart(4, '0')}`,
        randomizationNumber: status !== 'Screened' ? `RND${String(i).padStart(4, '0')}` : undefined,
        enrollmentDate: enrollmentDate.toISOString().split('T')[0],
        randomizationDate: status !== 'Screened' ? this.addDays(enrollmentDate, Math.floor(Math.random() * 7)).toISOString().split('T')[0] : undefined,
        status,
        arm: status !== 'Screened' ? (Math.random() < 0.5 ? 'Treatment' : 'Placebo') : undefined,
        visits: [],
        adverseEvents: [],
        protocolDeviations: [],
        withdrawalDate: status === 'Withdrawn' ? this.addDays(enrollmentDate, Math.floor(Math.random() * 180)).toISOString().split('T')[0] : undefined,
        withdrawalReason: status === 'Withdrawn' ? this.randomWithdrawalReason() : undefined,
        completionDate: status === 'Completed' ? this.addDays(enrollmentDate, 180 + Math.floor(Math.random() * 30)).toISOString().split('T')[0] : undefined,
        createdAt: enrollmentDate.toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
        createdBy: 'system',
        lastModifiedBy: 'system',
      });
    }
    
    return this.applyFetchOptions(patients, options);
  }

  async fetchPatientVisitData(studyId: string, patientId?: string, options?: FetchOptions): Promise<PatientVisit[]> {
    await this.simulateDelay();
    
    const visits: PatientVisit[] = [];
    const patients = patientId ? [patientId] : await this.getPatientIds(studyId);
    
    const visitSchedule = [
      { name: 'Screening', number: 1, daysFromBaseline: -7 },
      { name: 'Baseline', number: 2, daysFromBaseline: 0 },
      { name: 'Week 4', number: 3, daysFromBaseline: 28 },
      { name: 'Week 8', number: 4, daysFromBaseline: 56 },
      { name: 'Week 12', number: 5, daysFromBaseline: 84 },
      { name: 'Week 24', number: 6, daysFromBaseline: 168 },
      { name: 'End of Study', number: 7, daysFromBaseline: 180 },
    ];

    for (const pId of patients) {
      const enrollmentDate = new Date('2024-01-01');
      
      for (const visit of visitSchedule) {
        const scheduledDate = this.addDays(enrollmentDate, visit.daysFromBaseline);
        const actualDate = Math.random() < 0.9 ? this.addDays(scheduledDate, Math.floor(Math.random() * 7) - 3) : undefined;
        
        visits.push({
          id: `visit-${pId}-${visit.number}`,
          visitId: `V${visit.number}-${pId}`,
          patientId: pId,
          studyId,
          siteId: `site-${Math.floor(Math.random() * 10) + 1}`,
          visitName: visit.name,
          visitNumber: visit.number,
          scheduledDate: scheduledDate.toISOString().split('T')[0],
          actualDate: actualDate?.toISOString().split('T')[0],
          status: this.randomVisitStatus(),
          formsCompleted: Math.floor(Math.random() * 8) + 2,
          formsTotal: 10,
          queriesOpen: Math.floor(Math.random() * 3),
          queriesResolved: Math.floor(Math.random() * 5),
          sdvStatus: this.randomSDVStatus(),
          monitoringNotes: Math.random() < 0.3 ? 'Minor protocol deviation noted' : undefined,
          createdAt: scheduledDate.toISOString(),
          updatedAt: new Date().toISOString(),
          version: 1,
          createdBy: 'system',
          lastModifiedBy: 'system',
        });
      }
    }
    
    return this.applyFetchOptions(visits, options);
  }

  async fetchAdverseEvents(studyId: string, options?: FetchOptions): Promise<AdverseEvent[]> {
    await this.simulateDelay();
    
    const events: AdverseEvent[] = [];
    const eventCount = Math.floor(Math.random() * 50) + 20;
    
    const commonAEs = [
      'Headache', 'Nausea', 'Fatigue', 'Dizziness', 'Diarrhea',
      'Injection site reaction', 'Upper respiratory infection', 'Insomnia'
    ];
    
    for (let i = 1; i <= eventCount; i++) {
      const startDate = this.randomDate(new Date('2024-01-01'), new Date());
      const ongoing = Math.random() < 0.3;
      
      events.push({
        id: `ae-${i}`,
        aeId: `AE${String(i).padStart(4, '0')}`,
        patientId: `P${studyId}-${String(Math.floor(Math.random() * 150) + 1).padStart(4, '0')}`,
        studyId,
        siteId: `site-${Math.floor(Math.random() * 10) + 1}`,
        term: commonAEs[Math.floor(Math.random() * commonAEs.length)],
        severity: this.randomSeverity(),
        relationship: this.randomRelationship(),
        startDate: startDate.toISOString().split('T')[0],
        endDate: ongoing ? undefined : this.addDays(startDate, Math.floor(Math.random() * 14) + 1).toISOString().split('T')[0],
        ongoing,
        serious: Math.random() < 0.1,
        reportedDate: this.addDays(startDate, Math.floor(Math.random() * 3)).toISOString().split('T')[0],
        reportedBy: 'Investigator',
        createdAt: startDate.toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
        createdBy: 'system',
        lastModifiedBy: 'system',
      });
    }
    
    return this.applyFetchOptions(events, options);
  }

  async fetchProtocolDeviations(studyId: string, options?: FetchOptions): Promise<ProtocolDeviation[]> {
    await this.simulateDelay();
    
    const deviations: ProtocolDeviation[] = [];
    const deviationCount = Math.floor(Math.random() * 20) + 5;
    
    const deviationTypes = [
      'Visit window deviation', 'Medication compliance', 'Inclusion/Exclusion criteria',
      'Informed consent', 'Laboratory collection', 'Concomitant medication'
    ];
    
    for (let i = 1; i <= deviationCount; i++) {
      const occurredDate = this.randomDate(new Date('2024-01-01'), new Date());
      
      deviations.push({
        id: `pd-${i}`,
        deviationId: `PD${String(i).padStart(4, '0')}`,
        patientId: `P${studyId}-${String(Math.floor(Math.random() * 150) + 1).padStart(4, '0')}`,
        studyId,
        siteId: `site-${Math.floor(Math.random() * 10) + 1}`,
        type: Math.random() < 0.8 ? 'Minor' : 'Major',
        category: deviationTypes[Math.floor(Math.random() * deviationTypes.length)],
        description: 'Protocol deviation details...',
        occurredDate: occurredDate.toISOString().split('T')[0],
        reportedDate: this.addDays(occurredDate, Math.floor(Math.random() * 7)).toISOString().split('T')[0],
        reportedBy: 'Site Coordinator',
        impact: this.randomImpact(),
        correctionRequired: Math.random() < 0.6,
        correctionDescription: Math.random() < 0.6 ? 'Corrective action implemented' : undefined,
        status: this.randomDeviationStatus(),
        createdAt: occurredDate.toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
        createdBy: 'system',
        lastModifiedBy: 'system',
      });
    }
    
    return this.applyFetchOptions(deviations, options);
  }

  async getDataCompleteness(studyId: string): Promise<DataCompletenessReport> {
    await this.simulateDelay();
    
    const siteCount = 10;
    const formTypes = ['Demographics', 'Medical History', 'Vital Signs', 'Laboratory', 'Adverse Events'];
    
    return {
      studyId,
      overallCompleteness: 85 + Math.random() * 10,
      siteCompleteness: Array.from({ length: siteCount }, (_, i) => ({
        siteId: `site-${i + 1}`,
        completeness: 75 + Math.random() * 20,
        missingForms: Math.floor(Math.random() * 10),
        totalForms: 100 + Math.floor(Math.random() * 50),
      })),
      formCompleteness: formTypes.map(formName => ({
        formName,
        completeness: 80 + Math.random() * 15,
        completedCount: Math.floor(Math.random() * 150) + 100,
        totalCount: Math.floor(Math.random() * 50) + 150,
      })),
      generatedAt: new Date().toISOString(),
    };
  }

  async getQueryMetrics(studyId: string): Promise<QueryMetrics> {
    await this.simulateDelay();
    
    const totalQueries = Math.floor(Math.random() * 200) + 50;
    const resolvedQueries = Math.floor(totalQueries * (0.7 + Math.random() * 0.2));
    
    return {
      studyId,
      totalQueries,
      openQueries: totalQueries - resolvedQueries,
      resolvedQueries,
      averageResolutionTime: 24 + Math.random() * 48,
      queriesByType: [
        { type: 'Missing Data', count: Math.floor(totalQueries * 0.4) },
        { type: 'Data Clarification', count: Math.floor(totalQueries * 0.3) },
        { type: 'Protocol Deviation', count: Math.floor(totalQueries * 0.2) },
        { type: 'Other', count: Math.floor(totalQueries * 0.1) },
      ],
      queriesBySite: Array.from({ length: 10 }, (_, i) => ({
        siteId: `site-${i + 1}`,
        openQueries: Math.floor(Math.random() * 10),
        resolvedQueries: Math.floor(Math.random() * 20) + 5,
      })),
    };
  }

  async subscribeToEnrollmentUpdates(studyId: string, callback: (data: EnrollmentData) => void): Promise<string> {
    const subscriptionId = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.subscriptions.set(subscriptionId, callback);
    return subscriptionId;
  }

  async unsubscribeFromUpdates(subscriptionId: string): Promise<void> {
    this.subscriptions.delete(subscriptionId);
  }

  // Private helper methods
  private async simulateDelay(): Promise<void> {
    const delay = Math.random() * 500 + 100; // 100-600ms
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

  private async getPatientIds(studyId: string): Promise<string[]> {
    const count = Math.floor(Math.random() * 20) + 10;
    return Array.from({ length: count }, (_, i) => `P${studyId}-${String(i + 1).padStart(4, '0')}`);
  }

  private randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private randomPatientStatus(): PatientStatus {
    const statuses: PatientStatus[] = ['Enrolled', 'Randomized', 'Active', 'Completed', 'Withdrawn'];
    const weights = [0.1, 0.15, 0.4, 0.25, 0.1];
    return this.weightedRandom(statuses, weights);
  }

  private randomVisitStatus(): VisitStatus {
    const statuses: VisitStatus[] = ['Completed', 'Scheduled', 'Missed', 'Rescheduled'];
    const weights = [0.7, 0.2, 0.05, 0.05];
    return this.weightedRandom(statuses, weights);
  }

  private randomSDVStatus(): SDVStatus {
    const statuses: SDVStatus[] = ['Completed', 'In Progress', 'Not Started', 'Verified'];
    const weights = [0.4, 0.3, 0.2, 0.1];
    return this.weightedRandom(statuses, weights);
  }

  private randomSeverity(): 'Mild' | 'Moderate' | 'Severe' | 'Life-threatening' | 'Fatal' {
    const severities = ['Mild', 'Moderate', 'Severe', 'Life-threatening', 'Fatal'] as const;
    const weights = [0.5, 0.3, 0.15, 0.04, 0.01];
    return this.weightedRandom(severities, weights);
  }

  private randomRelationship(): 'Unrelated' | 'Unlikely' | 'Possible' | 'Probable' | 'Definite' {
    const relationships = ['Unrelated', 'Unlikely', 'Possible', 'Probable', 'Definite'] as const;
    const weights = [0.3, 0.25, 0.25, 0.15, 0.05];
    return this.weightedRandom(relationships, weights);
  }

  private randomWithdrawalReason(): string {
    const reasons = [
      'Adverse Event', 'Lost to Follow-up', 'Withdrawal of Consent',
      'Protocol Violation', 'Investigator Decision', 'Other'
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  private randomImpact(): 'None' | 'Low' | 'Medium' | 'High' {
    const impacts = ['None', 'Low', 'Medium', 'High'] as const;
    const weights = [0.4, 0.35, 0.2, 0.05];
    return this.weightedRandom(impacts, weights);
  }

  private randomDeviationStatus(): 'Open' | 'Under Review' | 'Resolved' | 'Closed' {
    const statuses = ['Open', 'Under Review', 'Resolved', 'Closed'] as const;
    const weights = [0.2, 0.3, 0.3, 0.2];
    return this.weightedRandom(statuses, weights);
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

  private startSimulation(): void {
    // Simulate real-time enrollment updates every 30 seconds
    this.simulationInterval = setInterval(() => {
      if (this.subscriptions.size > 0) {
        const mockUpdate: EnrollmentData = {
          studyId: 'ONCOLOGY-2024-001',
          date: new Date().toISOString().split('T')[0],
          cumulativeEnrollment: Math.floor(Math.random() * 500),
          newEnrollments: Math.random() < 0.3 ? 1 : 0,
          targetEnrollment: 500,
          enrollmentRate: 2.5 + Math.random() * 1.5,
          projectedCompletion: '2024-12-31',
        };

        this.subscriptions.forEach(callback => callback(mockUpdate));
      }
    }, 30000);
  }

  private stopSimulation(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = undefined;
    }
  }
}
