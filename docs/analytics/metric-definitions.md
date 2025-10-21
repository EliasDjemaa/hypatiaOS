# Metric Definitions
**Version**: 1.0  
**Last Updated**: October 19, 2024  
**Owner**: Analytics Team  

---

## 📊 Overview

This document defines all metrics, KPIs, and calculated fields used across the hypatiaOS platform. Each metric includes its business purpose, calculation formula, data sources, and display specifications.

---

## 🎯 Core Study Metrics

### **Enrollment Progress**
**Definition**: Percentage of target enrollment achieved  
**Business Purpose**: Track recruitment performance and timeline adherence  
**Formula**: `(currentEnrollment / targetEnrollment) * 100`  
**Data Sources**: EDC/IRT (currentEnrollment), Protocol (targetEnrollment)  
**Refresh Rate**: Real-time (on enrollment events)  
**Display Format**: Percentage with 1 decimal place (68.4%)  
**Thresholds**:
- 🟢 Good: ≥ 80% of planned enrollment rate
- 🟡 Warning: 60-79% of planned enrollment rate  
- 🔴 Critical: < 60% of planned enrollment rate

**Usage Examples**:
- Portfolio dashboard progress bars
- Study detail enrollment charts
- Forecasting model inputs

---

### **Budget Utilization**
**Definition**: Percentage of approved budget that has been committed or spent  
**Business Purpose**: Monitor financial performance and prevent budget overruns  
**Formula**: `((completedPayments + pendingPayments) / finalizedBudget) * 100`  
**Data Sources**: FOE (payments), Budget Service (finalizedBudget)  
**Refresh Rate**: Hourly  
**Display Format**: Percentage with 1 decimal place (62.8%)  
**Thresholds**:
- 🟢 Good: ≤ 85% utilization
- 🟡 Warning: 85-95% utilization
- 🔴 Critical: > 95% utilization

**Special Cases**:
- If `finalizedBudget` = 0, display "Not Available"
- If utilization > 100%, highlight as budget overrun

---

### **Health Score**
**Definition**: AI-calculated composite metric indicating overall study performance  
**Business Purpose**: Provide single-glance study health assessment for prioritization  
**Formula**: 
```typescript
healthScore = weightedAverage([
  { metric: enrollmentEfficiency, weight: 0.30 },
  { metric: budgetCompliance, weight: 0.25 },
  { metric: ctaExecutionEfficiency, weight: 0.20 },
  { metric: dataQualityScore, weight: 0.15 },
  { metric: complianceScore, weight: 0.10 }
]);
```
**Data Sources**: Multiple systems via AI Engine aggregation  
**Refresh Rate**: Daily (overnight batch processing)  
**Display Format**: Integer score 0-100  
**Thresholds**:
- 🟢 Good: 80-100
- 🟡 Warning: 60-79
- 🔴 Critical: 0-59

**Component Metrics**:
1. **Enrollment Efficiency**: Actual vs. planned enrollment rate
2. **Budget Compliance**: Variance from approved budget
3. **CTA Execution Efficiency**: Contract turnaround time vs. benchmark
4. **Data Quality Score**: Query rate and resolution time
5. **Compliance Score**: Protocol deviations and audit findings

---

### **CTA Execution Efficiency**
**Definition**: Median days to execute Clinical Trial Agreements  
**Business Purpose**: Measure operational efficiency in contract management  
**Formula**: `median(executedDate - sentDate)` for all contracts in study  
**Data Sources**: Contract Service (contract dates)  
**Refresh Rate**: Daily  
**Display Format**: Integer days (18 days)  
**Benchmarks**:
- 🟢 Excellent: ≤ 14 days
- 🟡 Good: 15-21 days
- 🔴 Needs Improvement: > 21 days

---

### **Site Activation Rate**
**Definition**: Percentage of planned sites that are activated and recruiting  
**Business Purpose**: Track study startup progress and site readiness  
**Formula**: `(sitesActivated / totalSites) * 100`  
**Data Sources**: CTMS (site status), Manual entry  
**Refresh Rate**: Daily  
**Display Format**: Fraction and percentage (12/15 sites, 80%)  

---

## 💰 Financial Metrics

### **Budget Variance**
**Definition**: Percentage change from initial budget estimate to finalized budget  
**Business Purpose**: Track budget accuracy and negotiation outcomes  
**Formula**: `((finalizedBudget - estimatedBudget) / estimatedBudget) * 100`  
**Data Sources**: Budget Service (budget versions)  
**Refresh Rate**: On budget updates  
**Display Format**: Percentage with 1 decimal place (+8.7%)  
**Interpretation**:
- Positive: Budget increased from estimate
- Negative: Budget decreased from estimate
- Zero: No change from estimate

---

### **Payment Completion Rate**
**Definition**: Percentage of total budget that has been paid out  
**Business Purpose**: Track cash flow and payment processing efficiency  
**Formula**: `(completedPayments / finalizedBudget) * 100`  
**Data Sources**: FOE (payment records), Budget Service  
**Refresh Rate**: Real-time (on payment completion)  
**Display Format**: Percentage with 1 decimal place (35.2%)  

---

### **Burn Rate**
**Definition**: Average monthly spend rate  
**Business Purpose**: Forecast remaining budget duration and cash flow needs  
**Formula**: `totalSpend / monthsActive`  
**Data Sources**: FOE (payment history), Study dates  
**Refresh Rate**: Monthly  
**Display Format**: Currency per month ($208,333/month)  

---

## 📈 Operational Metrics

### **Query Resolution Time**
**Definition**: Average days to resolve data queries  
**Business Purpose**: Measure data management efficiency and quality  
**Formula**: `average(resolvedDate - createdDate)` for resolved queries  
**Data Sources**: EDC (query management)  
**Refresh Rate**: Daily  
**Display Format**: Decimal days (4.2 days)  
**Benchmarks**:
- 🟢 Excellent: ≤ 3 days
- 🟡 Good: 3-7 days
- 🔴 Needs Improvement: > 7 days

---

### **Protocol Deviation Rate**
**Definition**: Number of protocol deviations per enrolled patient  
**Business Purpose**: Monitor study conduct quality and compliance  
**Formula**: `protocolDeviations / currentEnrollment`  
**Data Sources**: EDC (deviations), Enrollment data  
**Refresh Rate**: Daily  
**Display Format**: Decimal ratio (0.05 deviations/patient)  

---

### **Data Completeness**
**Definition**: Percentage of required data fields that are populated  
**Business Purpose**: Track data collection progress and quality  
**Formula**: `(populatedFields / requiredFields) * 100`  
**Data Sources**: EDC (form completion status)  
**Refresh Rate**: Real-time  
**Display Format**: Percentage (94.5%)  

---

## 🔍 Portfolio-Level Metrics

### **Portfolio Health Distribution**
**Definition**: Count of studies by health indicator category  
**Business Purpose**: Executive overview of portfolio performance  
**Calculation**: Count studies by `healthIndicator` value  
**Data Sources**: Study records (healthIndicator)  
**Refresh Rate**: Hourly  
**Display Format**: Count and percentage by category  

### **Average Enrollment Rate**
**Definition**: Portfolio-wide average monthly enrollment rate  
**Business Purpose**: Benchmark individual study performance  
**Formula**: `sum(monthlyEnrollments) / activeStudies`  
**Data Sources**: All active studies enrollment data  
**Refresh Rate**: Monthly  
**Display Format**: Patients per month (12.3 patients/month)  

### **Total Portfolio Value**
**Definition**: Sum of all active study budgets  
**Business Purpose**: Financial oversight and resource allocation  
**Formula**: `sum(finalizedBudget)` for active studies  
**Data Sources**: Budget Service (all active studies)  
**Refresh Rate**: Daily  
**Display Format**: Currency ($45.2M)  

---

## 🎨 Display Specifications

### **Color Coding Standards**
| Metric Range | Color | Hex Code | Usage |
|--------------|-------|----------|-------|
| **Excellent/Good** | Green | #10B981 | Progress bars, chips, indicators |
| **Warning/Caution** | Yellow/Orange | #F59E0B | Alert states, moderate performance |
| **Critical/Poor** | Red | #EF4444 | Error states, poor performance |
| **Neutral/Info** | Blue | #6366F1 | Default states, informational |
| **Disabled/Inactive** | Gray | #6B7280 | Inactive elements |

### **Progress Bar Styling**
```css
.progress-bar {
  height: 6px;
  border-radius: 3px;
  background-color: #f0f0f0;
}

.progress-bar.enrollment {
  color: #10B981; /* Green for good progress */
}

.progress-bar.budget {
  color: #F59E0B; /* Orange for budget tracking */
}

.progress-bar.critical {
  color: #EF4444; /* Red for overruns */
}
```

### **Number Formatting**
| Data Type | Format | Example |
|-----------|--------|---------|
| **Currency** | Locale-specific with symbol | $2,500,000 |
| **Percentage** | 1 decimal place with % | 68.4% |
| **Days** | Integer with "days" label | 18 days |
| **Counts** | Integer with thousand separators | 1,250 |
| **Ratios** | 2 decimal places | 0.05 |

---

## 🔄 Refresh Schedules

### **Real-Time Metrics** (< 1 minute)
- Enrollment Progress (on patient enrollment)
- Budget Utilization (on payment processing)
- Data Completeness (on form submission)

### **Hourly Metrics**
- Portfolio Health Distribution
- Payment Completion Rate
- Site Activation Status

### **Daily Metrics**
- Health Score (overnight batch)
- CTA Execution Efficiency
- Query Resolution Time
- Protocol Deviation Rate

### **Monthly Metrics**
- Burn Rate calculation
- Portfolio benchmarks
- Historical trend analysis

---

## 📊 Data Quality Monitoring

### **Metric Validation Rules**
1. **Range Validation**: All percentages must be 0-100%
2. **Logical Consistency**: Current enrollment ≤ Target enrollment
3. **Temporal Consistency**: Dates must be chronologically logical
4. **Cross-Metric Validation**: Related metrics must be mathematically consistent

### **Alert Thresholds**
| Condition | Alert Level | Action |
|-----------|-------------|--------|
| Metric calculation fails | Critical | Immediate notification to data team |
| Data source unavailable | Warning | Retry mechanism, fallback to cached values |
| Metric outside expected range | Info | Log for investigation |
| Stale data (> 24 hours) | Warning | Data refresh notification |

---

## 🔧 Implementation Notes

### **Caching Strategy**
- **Real-time metrics**: No caching, direct calculation
- **Daily metrics**: Cache for 1 hour
- **Monthly metrics**: Cache for 24 hours
- **Historical data**: Cache for 7 days

### **Performance Considerations**
- Pre-calculate complex metrics during off-peak hours
- Use materialized views for frequently accessed aggregations
- Implement incremental updates for large datasets
- Monitor query performance and optimize as needed

---

**This document serves as the authoritative reference for all metrics used in hypatiaOS. Any changes to metric definitions must be approved by the Analytics Team and updated in this document.**
