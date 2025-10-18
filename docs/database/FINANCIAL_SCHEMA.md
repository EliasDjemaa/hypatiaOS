# Financial Database Schema

## Overview

The hypatiaOS financial database schema is designed to support comprehensive financial operations for clinical trials, including contract management, budgeting, payments, and analytics.

## Core Financial Tables

### Organizations
```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('sponsor', 'cro', 'site', 'vendor')),
    country VARCHAR(3),
    currency VARCHAR(3) DEFAULT 'USD',
    tax_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Contracts
```sql
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_number VARCHAR(50) UNIQUE NOT NULL,
    contract_type VARCHAR(50) NOT NULL CHECK (contract_type IN (
        'master_service_agreement', 'study_contract', 'site_agreement', 
        'amendment', 'change_order'
    )),
    sponsor_organization_id UUID NOT NULL REFERENCES organizations(id),
    cro_organization_id UUID NOT NULL REFERENCES organizations(id),
    study_id UUID REFERENCES studies(id),
    title VARCHAR(500) NOT NULL,
    contract_value DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    effective_date DATE,
    expiration_date DATE,
    ai_risk_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Budgets
```sql
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_number VARCHAR(50) UNIQUE NOT NULL,
    contract_id UUID NOT NULL REFERENCES contracts(id),
    study_id UUID NOT NULL REFERENCES studies(id),
    site_id UUID REFERENCES sites(id),
    budget_type VARCHAR(50) NOT NULL,
    total_budget DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    forecast_accuracy DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Budget Line Items
```sql
CREATE TABLE budget_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    line_item_number VARCHAR(10) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description VARCHAR(500) NOT NULL,
    unit_type VARCHAR(50),
    unit_rate DECIMAL(10,2) NOT NULL,
    estimated_units INTEGER DEFAULT 1,
    total_amount DECIMAL(15,2) GENERATED ALWAYS AS (unit_rate * estimated_units) STORED,
    milestone_trigger VARCHAR(200),
    milestone_percentage DECIMAL(5,2) DEFAULT 100.00
);
```

### Site Payments
```sql
CREATE TABLE site_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_reference VARCHAR(100) UNIQUE NOT NULL,
    study_id UUID NOT NULL REFERENCES studies(id),
    site_id UUID NOT NULL REFERENCES sites(id),
    payment_type VARCHAR(50) NOT NULL,
    base_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    exchange_rate DECIMAL(10,6) DEFAULT 1.000000,
    local_amount DECIMAL(10,2) GENERATED ALWAYS AS (base_amount * exchange_rate) STORED,
    vat_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) GENERATED ALWAYS AS (local_amount + vat_amount) STORED,
    due_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    triggered_by_edc BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Invoices
```sql
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    study_id UUID NOT NULL REFERENCES studies(id),
    site_id UUID REFERENCES sites(id),
    budget_line_item_id UUID REFERENCES budget_line_items(id),
    invoice_amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    due_date DATE NOT NULL,
    milestone_trigger VARCHAR(200),
    payment_terms INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Advanced Financial Tables

### Financial Forecasts
```sql
CREATE TABLE financial_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id UUID NOT NULL REFERENCES studies(id),
    forecast_type VARCHAR(50) NOT NULL,
    scenario_name VARCHAR(100) NOT NULL,
    base_assumptions JSONB NOT NULL,
    projected_costs JSONB NOT NULL,
    confidence_level DECIMAL(5,2) NOT NULL,
    forecast_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Contract Risk Assessments
```sql
CREATE TABLE contract_risk_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id),
    overall_risk_score DECIMAL(3,2) NOT NULL,
    risk_factors JSONB NOT NULL,
    recommendations JSONB NOT NULL,
    assessment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ai_model_version VARCHAR(20) NOT NULL
);
```

### Payment Transactions
```sql
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_payment_id UUID NOT NULL REFERENCES site_payments(id),
    transaction_reference VARCHAR(100) UNIQUE NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    bank_reference VARCHAR(100),
    processed_amount DECIMAL(15,2) NOT NULL,
    processing_fee DECIMAL(10,2) DEFAULT 0.00,
    transaction_status VARCHAR(50) NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    reconciled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Financial Audit Logs
```sql
CREATE TABLE financial_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    object_type VARCHAR(50) NOT NULL,
    object_id UUID NOT NULL,
    user_id UUID REFERENCES users(id),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    reason TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Multi-Currency Support Tables

### Exchange Rates
```sql
CREATE TABLE exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_currency VARCHAR(3) NOT NULL,
    target_currency VARCHAR(3) NOT NULL,
    rate DECIMAL(12,6) NOT NULL,
    rate_date DATE NOT NULL,
    source VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(base_currency, target_currency, rate_date)
);
```

### Currency Configurations
```sql
CREATE TABLE currency_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    currency_code VARCHAR(3) PRIMARY KEY,
    currency_name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    decimal_places INTEGER DEFAULT 2,
    is_active BOOLEAN DEFAULT true,
    supported_countries VARCHAR(3)[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Analytics & Reporting Views

### Financial Performance View
```sql
CREATE VIEW financial_performance AS
SELECT 
    s.id as study_id,
    s.title as study_title,
    b.total_budget,
    COALESCE(SUM(sp.total_amount), 0) as actual_spend,
    (COALESCE(SUM(sp.total_amount), 0) / b.total_budget) * 100 as utilization_percentage,
    COUNT(sp.id) as payment_count,
    AVG(EXTRACT(days FROM (sp.created_at - sp.due_date))) as avg_payment_delay
FROM studies s
LEFT JOIN budgets b ON s.id = b.study_id
LEFT JOIN site_payments sp ON s.id = sp.study_id AND sp.status = 'paid'
GROUP BY s.id, s.title, b.total_budget;
```

### Contract Risk Summary View
```sql
CREATE VIEW contract_risk_summary AS
SELECT 
    c.id as contract_id,
    c.contract_number,
    c.title,
    c.contract_value,
    cra.overall_risk_score,
    CASE 
        WHEN cra.overall_risk_score < 0.3 THEN 'Low'
        WHEN cra.overall_risk_score < 0.6 THEN 'Medium'
        ELSE 'High'
    END as risk_level,
    cra.assessment_date
FROM contracts c
LEFT JOIN contract_risk_assessments cra ON c.id = cra.contract_id
WHERE cra.assessment_date = (
    SELECT MAX(assessment_date) 
    FROM contract_risk_assessments cra2 
    WHERE cra2.contract_id = c.id
);
```

## Indexes for Performance

```sql
-- Contract indexes
CREATE INDEX idx_contracts_sponsor ON contracts(sponsor_organization_id);
CREATE INDEX idx_contracts_cro ON contracts(cro_organization_id);
CREATE INDEX idx_contracts_study ON contracts(study_id);
CREATE INDEX idx_contracts_status ON contracts(status);

-- Budget indexes
CREATE INDEX idx_budgets_contract ON budgets(contract_id);
CREATE INDEX idx_budgets_study ON budgets(study_id);
CREATE INDEX idx_budgets_status ON budgets(status);

-- Payment indexes
CREATE INDEX idx_site_payments_study ON site_payments(study_id);
CREATE INDEX idx_site_payments_site ON site_payments(site_id);
CREATE INDEX idx_site_payments_status ON site_payments(status);
CREATE INDEX idx_site_payments_due_date ON site_payments(due_date);

-- Invoice indexes
CREATE INDEX idx_invoices_study ON invoices(study_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- Audit log indexes
CREATE INDEX idx_financial_audit_logs_object ON financial_audit_logs(object_type, object_id);
CREATE INDEX idx_financial_audit_logs_user ON financial_audit_logs(user_id);
CREATE INDEX idx_financial_audit_logs_timestamp ON financial_audit_logs(timestamp);

-- Exchange rate indexes
CREATE INDEX idx_exchange_rates_currencies ON exchange_rates(base_currency, target_currency);
CREATE INDEX idx_exchange_rates_date ON exchange_rates(rate_date);
```

## Data Relationships

The financial schema maintains referential integrity through:

1. **Organizations** → **Contracts** (sponsor and CRO relationships)
2. **Contracts** → **Budgets** (contract-budget linkage)
3. **Budgets** → **Budget Line Items** (detailed budget breakdown)
4. **Studies** → **Site Payments** (study-payment relationship)
5. **Site Payments** → **Payment Transactions** (payment processing)
6. **All Financial Objects** → **Financial Audit Logs** (complete audit trail)

This schema supports:
- Multi-currency operations
- Complex payment arrangements
- AI-powered analytics
- Comprehensive audit trails
- Real-time financial reporting
- Regulatory compliance requirements
