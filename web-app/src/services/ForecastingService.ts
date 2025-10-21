/**
 * AI Forecasting Service
 * 
 * Provides predictive analytics for enrollment, budget, and timeline forecasting.
 * Uses machine learning algorithms to analyze historical data and predict future trends.
 * Initially works with synthetic data and mock models.
 */

import { dataService } from './DataService';
import { EnrollmentData, Study, FinancialSnapshot } from '../types/schemas';

export interface EnrollmentForecast {
  studyId: string;
  forecastDate: string;
  predictions: Array<{
    date: string;
    predictedEnrollment: number;
    confidence: number; // 0-1
    lowerBound: number;
    upperBound: number;
  }>;
  completionDate: string;
  accuracy: number;
  factors: ForecastFactor[];
  recommendations: string[];
}

export interface BudgetForecast {
  studyId: string;
  forecastDate: string;
  predictions: Array<{
    month: string;
    predictedSpend: number;
    confidence: number;
    category: string;
  }>;
  projectedOverrun: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  recommendations: string[];
}

export interface TimelineForecast {
  studyId: string;
  forecastDate: string;
  milestones: Array<{
    name: string;
    originalDate: string;
    predictedDate: string;
    confidence: number;
    delayRisk: number; // 0-1
    criticalPath: boolean;
  }>;
  overallDelay: number; // days
  recommendations: string[];
}

export interface ForecastFactor {
  name: string;
  impact: number; // -1 to 1
  description: string;
  weight: number; // 0-1
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  mse: number; // Mean Squared Error
  lastTrained: string;
  trainingDataSize: number;
}

class ForecastingService {
  private static instance: ForecastingService;
  private models = new Map<string, any>();
  private modelMetrics = new Map<string, ModelMetrics>();

  private constructor() {
    this.initializeModels();
  }

  static getInstance(): ForecastingService {
    if (!ForecastingService.instance) {
      ForecastingService.instance = new ForecastingService();
    }
    return ForecastingService.instance;
  }

  private initializeModels(): void {
    // Initialize mock ML models
    this.models.set('enrollment', new EnrollmentModel());
    this.models.set('budget', new BudgetModel());
    this.models.set('timeline', new TimelineModel());

    // Initialize model metrics
    this.modelMetrics.set('enrollment', {
      accuracy: 0.85,
      precision: 0.82,
      recall: 0.88,
      mse: 0.15,
      lastTrained: new Date().toISOString(),
      trainingDataSize: 1000,
    });

    this.modelMetrics.set('budget', {
      accuracy: 0.78,
      precision: 0.75,
      recall: 0.81,
      mse: 0.22,
      lastTrained: new Date().toISOString(),
      trainingDataSize: 800,
    });

    this.modelMetrics.set('timeline', {
      accuracy: 0.72,
      precision: 0.70,
      recall: 0.74,
      mse: 0.28,
      lastTrained: new Date().toISOString(),
      trainingDataSize: 600,
    });
  }

  async forecastEnrollment(studyId: string, horizon: number = 90): Promise<EnrollmentForecast> {
    try {
      // Get historical enrollment data
      const historicalData = await dataService.getEnrollmentData(studyId, { limit: 180 });
      const study = await dataService.getStudy(studyId);
      
      if (historicalData.length < 10) {
        throw new Error('Insufficient historical data for forecasting');
      }

      const model = this.models.get('enrollment');
      const predictions = model.predict(historicalData, horizon);
      
      // Calculate completion date
      const targetEnrollment = study.targetEnrollment;
      const completionPrediction = predictions.find(p => p.predictedEnrollment >= targetEnrollment);
      const completionDate = completionPrediction?.date || 
        this.extrapolateCompletionDate(predictions, targetEnrollment);

      // Analyze factors affecting enrollment
      const factors = this.analyzeEnrollmentFactors(historicalData, study);
      
      // Generate recommendations
      const recommendations = this.generateEnrollmentRecommendations(predictions, factors, study);

      return {
        studyId,
        forecastDate: new Date().toISOString(),
        predictions,
        completionDate,
        accuracy: this.modelMetrics.get('enrollment')?.accuracy || 0.85,
        factors,
        recommendations,
      };
    } catch (error) {
      console.error('Enrollment forecasting error:', error);
      throw error;
    }
  }

  async forecastBudget(studyId: string, horizon: number = 12): Promise<BudgetForecast> {
    try {
      // Get historical financial data
      const budgets = await dataService.getBudgets(studyId);
      const payments = await dataService.getPayments(studyId);
      const financialSnapshot = await dataService.getFinancialSnapshot(studyId);
      
      const model = this.models.get('budget');
      const predictions = model.predict({ budgets, payments, snapshot: financialSnapshot }, horizon);
      
      // Calculate risk level
      const totalBudget = financialSnapshot.totalBudget;
      const projectedSpend = predictions.reduce((sum, p) => sum + p.predictedSpend, 0);
      const projectedOverrun = Math.max(0, projectedSpend - totalBudget);
      const overrunPercentage = (projectedOverrun / totalBudget) * 100;
      
      const riskLevel = this.calculateBudgetRisk(overrunPercentage);
      const recommendations = this.generateBudgetRecommendations(predictions, riskLevel, projectedOverrun);

      return {
        studyId,
        forecastDate: new Date().toISOString(),
        predictions,
        projectedOverrun,
        riskLevel,
        recommendations,
      };
    } catch (error) {
      console.error('Budget forecasting error:', error);
      throw error;
    }
  }

  async forecastTimeline(studyId: string): Promise<TimelineForecast> {
    try {
      // Get study data and enrollment trends
      const study = await dataService.getStudy(studyId);
      const enrollmentData = await dataService.getEnrollmentData(studyId);
      const sites = await dataService.getSites(studyId);
      
      const model = this.models.get('timeline');
      const predictions = model.predict({ study, enrollmentData, sites });
      
      // Calculate overall delay
      const overallDelay = predictions.reduce((sum, milestone) => {
        const originalDate = new Date(milestone.originalDate);
        const predictedDate = new Date(milestone.predictedDate);
        const delay = (predictedDate.getTime() - originalDate.getTime()) / (1000 * 60 * 60 * 24);
        return sum + Math.max(0, delay);
      }, 0) / predictions.length;

      const recommendations = this.generateTimelineRecommendations(predictions, overallDelay);

      return {
        studyId,
        forecastDate: new Date().toISOString(),
        milestones: predictions,
        overallDelay: Math.round(overallDelay),
        recommendations,
      };
    } catch (error) {
      console.error('Timeline forecasting error:', error);
      throw error;
    }
  }

  async getModelMetrics(modelType: string): Promise<ModelMetrics | null> {
    return this.modelMetrics.get(modelType) || null;
  }

  async retrainModel(modelType: string, trainingData: any[]): Promise<boolean> {
    try {
      const model = this.models.get(modelType);
      if (!model) {
        throw new Error(`Model ${modelType} not found`);
      }

      // Simulate model retraining
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update metrics (mock improvement)
      const currentMetrics = this.modelMetrics.get(modelType);
      if (currentMetrics) {
        this.modelMetrics.set(modelType, {
          ...currentMetrics,
          accuracy: Math.min(0.95, currentMetrics.accuracy + 0.02),
          lastTrained: new Date().toISOString(),
          trainingDataSize: trainingData.length,
        });
      }

      return true;
    } catch (error) {
      console.error('Model retraining error:', error);
      return false;
    }
  }

  // Private helper methods
  private analyzeEnrollmentFactors(data: EnrollmentData[], study: Study): ForecastFactor[] {
    const factors: ForecastFactor[] = [];
    
    // Seasonal patterns
    const monthlyEnrollment = this.groupByMonth(data);
    const seasonalVariance = this.calculateVariance(Object.values(monthlyEnrollment));
    if (seasonalVariance > 0.2) {
      factors.push({
        name: 'Seasonal Variation',
        impact: seasonalVariance > 0.4 ? -0.3 : -0.1,
        description: 'Enrollment varies significantly by season',
        weight: 0.7,
      });
    }

    // Site performance
    const avgSitesActivated = study.sitesActivated / study.totalSites;
    if (avgSitesActivated < 0.8) {
      factors.push({
        name: 'Site Activation Delay',
        impact: -0.4,
        description: 'Not all sites are activated yet',
        weight: 0.8,
      });
    }

    // Enrollment velocity trend
    const recentTrend = this.calculateTrend(data.slice(-30));
    factors.push({
      name: 'Recent Trend',
      impact: recentTrend > 0 ? 0.3 : -0.3,
      description: recentTrend > 0 ? 'Enrollment is accelerating' : 'Enrollment is slowing',
      weight: 0.9,
    });

    return factors;
  }

  private generateEnrollmentRecommendations(
    predictions: any[],
    factors: ForecastFactor[],
    study: Study
  ): string[] {
    const recommendations: string[] = [];
    
    // Check if enrollment is behind target
    const currentProgress = study.enrollmentProgress;
    if (currentProgress < 70) {
      recommendations.push('Consider activating additional sites to accelerate enrollment');
      recommendations.push('Review inclusion/exclusion criteria for potential optimization');
    }

    // Site-specific recommendations
    if (study.sitesActivated < study.totalSites) {
      recommendations.push(`Prioritize activation of remaining ${study.totalSites - study.sitesActivated} sites`);
    }

    // Seasonal recommendations
    const seasonalFactor = factors.find(f => f.name === 'Seasonal Variation');
    if (seasonalFactor && seasonalFactor.impact < -0.2) {
      recommendations.push('Plan marketing campaigns during high-enrollment seasons');
    }

    // Velocity recommendations
    const trendFactor = factors.find(f => f.name === 'Recent Trend');
    if (trendFactor && trendFactor.impact < 0) {
      recommendations.push('Investigate recent enrollment slowdown and address barriers');
    }

    return recommendations;
  }

  private calculateBudgetRisk(overrunPercentage: number): 'Low' | 'Medium' | 'High' | 'Critical' {
    if (overrunPercentage < 5) return 'Low';
    if (overrunPercentage < 15) return 'Medium';
    if (overrunPercentage < 25) return 'High';
    return 'Critical';
  }

  private generateBudgetRecommendations(
    predictions: any[],
    riskLevel: string,
    projectedOverrun: number
  ): string[] {
    const recommendations: string[] = [];
    
    if (riskLevel === 'High' || riskLevel === 'Critical') {
      recommendations.push('Immediate budget review and cost optimization required');
      recommendations.push('Consider renegotiating site fees or payment terms');
    }

    if (projectedOverrun > 0) {
      recommendations.push(`Secure additional funding of $${(projectedOverrun / 1000).toFixed(0)}K`);
    }

    // Category-specific recommendations
    const highSpendCategories = predictions
      .filter(p => p.predictedSpend > 100000)
      .map(p => p.category);
    
    if (highSpendCategories.length > 0) {
      recommendations.push(`Focus cost control on: ${highSpendCategories.join(', ')}`);
    }

    return recommendations;
  }

  private generateTimelineRecommendations(predictions: any[], overallDelay: number): string[] {
    const recommendations: string[] = [];
    
    if (overallDelay > 30) {
      recommendations.push('Significant delays detected - consider timeline revision');
      recommendations.push('Implement accelerated enrollment strategies');
    }

    const criticalDelays = predictions.filter(p => p.criticalPath && p.delayRisk > 0.7);
    if (criticalDelays.length > 0) {
      recommendations.push('Focus resources on critical path milestones');
      criticalDelays.forEach(milestone => {
        recommendations.push(`Priority attention needed for: ${milestone.name}`);
      });
    }

    return recommendations;
  }

  private extrapolateCompletionDate(predictions: any[], targetEnrollment: number): string {
    // Simple linear extrapolation
    const lastPrediction = predictions[predictions.length - 1];
    const enrollmentRate = lastPrediction.predictedEnrollment / predictions.length;
    const remainingEnrollment = targetEnrollment - lastPrediction.predictedEnrollment;
    const daysToCompletion = remainingEnrollment / enrollmentRate;
    
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + daysToCompletion);
    return completionDate.toISOString();
  }

  private groupByMonth(data: EnrollmentData[]): Record<string, number> {
    return data.reduce((acc, item) => {
      const month = new Date(item.date).toISOString().substring(0, 7);
      acc[month] = (acc[month] || 0) + item.newEnrollments;
      return acc;
    }, {} as Record<string, number>);
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance) / mean; // Coefficient of variation
  }

  private calculateTrend(data: EnrollmentData[]): number {
    if (data.length < 2) return 0;
    
    const first = data[0].enrollmentRate;
    const last = data[data.length - 1].enrollmentRate;
    return (last - first) / first;
  }
}

// Mock ML Models
class EnrollmentModel {
  predict(historicalData: EnrollmentData[], horizon: number): any[] {
    const predictions = [];
    const baseRate = historicalData[historicalData.length - 1]?.enrollmentRate || 2.5;
    let cumulativeEnrollment = historicalData[historicalData.length - 1]?.cumulativeEnrollment || 0;
    
    for (let i = 1; i <= horizon; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      // Add some realistic variation
      const seasonalFactor = 1 + 0.2 * Math.sin((i / 30) * Math.PI);
      const randomFactor = 0.8 + Math.random() * 0.4;
      const predictedRate = baseRate * seasonalFactor * randomFactor;
      
      cumulativeEnrollment += predictedRate / 30; // Daily rate
      
      predictions.push({
        date: date.toISOString().split('T')[0],
        predictedEnrollment: Math.round(cumulativeEnrollment),
        confidence: 0.7 + Math.random() * 0.2,
        lowerBound: Math.round(cumulativeEnrollment * 0.8),
        upperBound: Math.round(cumulativeEnrollment * 1.2),
      });
    }
    
    return predictions;
  }
}

class BudgetModel {
  predict(data: any, horizon: number): any[] {
    const predictions = [];
    const categories = ['Site Fees', 'Patient Fees', 'Monitoring', 'Laboratory'];
    const baseSpend = data.snapshot.spentAmount / 8; // Monthly average
    
    for (let i = 1; i <= horizon; i++) {
      const month = new Date();
      month.setMonth(month.getMonth() + i);
      
      categories.forEach(category => {
        const categorySpend = baseSpend * (0.2 + Math.random() * 0.3);
        predictions.push({
          month: month.toISOString().substring(0, 7),
          predictedSpend: categorySpend,
          confidence: 0.6 + Math.random() * 0.3,
          category,
        });
      });
    }
    
    return predictions;
  }
}

class TimelineModel {
  predict(data: any): any[] {
    const milestones = [
      { name: 'First Patient In', originalDate: '2024-03-01', criticalPath: true },
      { name: '50% Enrollment', originalDate: '2024-08-01', criticalPath: true },
      { name: 'Last Patient In', originalDate: '2024-12-01', criticalPath: true },
      { name: 'Database Lock', originalDate: '2025-03-01', criticalPath: true },
      { name: 'Final Report', originalDate: '2025-06-01', criticalPath: false },
    ];
    
    return milestones.map(milestone => {
      const originalDate = new Date(milestone.originalDate);
      const delayDays = Math.random() * 60 - 15; // -15 to +45 days
      const predictedDate = new Date(originalDate);
      predictedDate.setDate(predictedDate.getDate() + delayDays);
      
      return {
        ...milestone,
        predictedDate: predictedDate.toISOString().split('T')[0],
        confidence: 0.6 + Math.random() * 0.3,
        delayRisk: Math.max(0, delayDays / 60),
      };
    });
  }
}

export const forecastingService = ForecastingService.getInstance();
export default forecastingService;
