# Advanced Financial Operations Schema Extensions

## Global Payment & Forecasting Tables

### global_payment_configs
Multi-currency and localization support for worldwide studies.

```sql
CREATE TABLE global_payment_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id UUID NOT NULL REFERENCES studies(id),
    country_code VARCHAR(3) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    exchange_rate DECIMAL(10,6) NOT NULL DEFAULT 1.000000,
    vat_rate DECIMAL(5,2), -- VAT percentage
    payment_methods JSONB, -- Supported payment methods
    banking_details JSONB, -- Local banking requirements
    regulatory_requirements JSONB, -- Country-specific regulations
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    UNIQUE(study_id, country_code)
);

CREATE INDEX idx_global_payment_configs_study ON global_payment_configs(study_id);
CREATE INDEX idx_global_payment_configs_country ON global_payment_configs(country_code);
```

### site_payment_configs
Flexible site payment configurations supporting various engagement models.

```sql
CREATE TABLE site_payment_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id UUID NOT NULL REFERENCES studies(id),
    site_id UUID NOT NULL REFERENCES sites(id),
    payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN (
        'visit_based', 'procedure_based', 'milestone_based', 'hybrid'
    )),
    split_payees JSONB, -- Multiple payee configurations
    local_currency VARCHAR(3) NOT NULL,
    vat_handling VARCHAR(20) CHECK (vat_handling IN ('inclusive', 'exclusive', 'exempt')),
    invoice_submission_method VARCHAR(20) CHECK (invoice_submission_method IN (
        'electronic', 'portal', 'email', 'api'
    )),
    payment_terms_days INTEGER DEFAULT 30,
    holdback_percentage DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    UNIQUE(study_id, site_id)
);

CREATE INDEX idx_site_payment_configs_study ON site_payment_configs(study_id);
CREATE INDEX idx_site_payment_configs_site ON site_payment_configs(site_id);
```

### rate_cards
Centrally managed rate cards and charge masters.

```sql
CREATE TABLE rate_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    rate_card_name VARCHAR(255) NOT NULL,
    therapeutic_area VARCHAR(100),
    study_phase VARCHAR(20),
    geography VARCHAR(100),
    effective_date DATE NOT NULL,
    expiration_date DATE,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_rate_cards_organization ON rate_cards(organization_id);
CREATE INDEX idx_rate_cards_therapeutic_area ON rate_cards(therapeutic_area);
CREATE INDEX idx_rate_cards_geography ON rate_cards(geography);
```

### rate_card_items
Individual rates within rate cards.

```sql
CREATE TABLE rate_card_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rate_card_id UUID NOT NULL REFERENCES rate_cards(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL CHECK (category IN (
        'startup', 'enrollment', 'visits', 'procedures', 'monitoring',
        'data_management', 'closeout', 'pass_through', 'other'
    )),
    item_code VARCHAR(50) NOT NULL,
    item_description VARCHAR(500) NOT NULL,
    unit_type VARCHAR(50) CHECK (unit_type IN (
        'fixed', 'per_participant', 'per_visit', 'per_procedure',
        'per_month', 'per_milestone', 'hourly', 'per_page'
    )),
    base_rate DECIMAL(10,2) NOT NULL,
    minimum_rate DECIMAL(10,2),
    maximum_rate DECIMAL(10,2),
    complexity_multipliers JSONB, -- Different rates based on complexity
    volume_discounts JSONB, -- Volume-based pricing tiers
    justification_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rate_card_items_rate_card ON rate_card_items(rate_card_id);
CREATE INDEX idx_rate_card_items_category ON rate_card_items(category);
CREATE INDEX idx_rate_card_items_code ON rate_card_items(item_code);
```

### budget_templates
Reusable budget templates for efficient budget creation.

```sql
CREATE TABLE budget_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name VARCHAR(255) NOT NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    therapeutic_area VARCHAR(100),
    study_phase VARCHAR(20),
    study_type VARCHAR(50),
    template_description TEXT,
    template_data JSONB NOT NULL, -- Complete budget structure
    version_number INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_budget_templates_organization ON budget_templates(organization_id);
CREATE INDEX idx_budget_templates_therapeutic_area ON budget_templates(therapeutic_area);
CREATE INDEX idx_budget_templates_phase ON budget_templates(study_phase);
```

### forecast_scenarios
Advanced forecasting with scenario modeling.

```sql
CREATE TABLE forecast_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id UUID NOT NULL REFERENCES studies(id),
    scenario_name VARCHAR(255) NOT NULL,
    scenario_description TEXT,
    study_assumptions JSONB NOT NULL, -- Screen fail, dropout, enrollment rates
    visit_flow JSONB NOT NULL, -- Visit schedule and costs
    milestones JSONB NOT NULL, -- Milestone probabilities and payments
    forecast_period_months INTEGER NOT NULL,
    base_scenario BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_forecast_scenarios_study ON forecast_scenarios(study_id);
CREATE INDEX idx_forecast_scenarios_base ON forecast_scenarios(base_scenario);
```

### forecast_results
Stored forecast calculations for performance and historical tracking.

```sql
CREATE TABLE forecast_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id UUID NOT NULL REFERENCES studies(id),
    scenario_id UUID REFERENCES forecast_scenarios(id),
    forecast_type VARCHAR(50) NOT NULL CHECK (forecast_type IN (
        'budget_template', 'scenario_modeling', 'portfolio_rollup'
    )),
    forecast_data JSONB NOT NULL, -- Monthly forecast breakdown
    total_projected_cost DECIMAL(15,2),
    total_projected_enrollment INTEGER,
    confidence_level DECIMAL(5,2), -- Forecast confidence percentage
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    generated_by UUID NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_forecast_results_study ON forecast_results(study_id);
CREATE INDEX idx_forecast_results_scenario ON forecast_results(scenario_id);
CREATE INDEX idx_forecast_results_type ON forecast_results(forecast_type);
```

### visit_rates
Visit-based payment rates for EDC-driven payments.

```sql
CREATE TABLE visit_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id UUID NOT NULL REFERENCES studies(id),
    site_id UUID REFERENCES sites(id), -- NULL for study-level rates
    visit_type VARCHAR(100) NOT NULL,
    visit_description VARCHAR(500),
    rate DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    effective_date DATE NOT NULL,
    expiration_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_visit_rates_study ON visit_rates(study_id);
CREATE INDEX idx_visit_rates_site ON visit_rates(site_id);
CREATE INDEX idx_visit_rates_type ON visit_rates(visit_type);
```

### procedure_rates
Procedure-based payment rates for granular payment control.

```sql
CREATE TABLE procedure_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id UUID NOT NULL REFERENCES studies(id),
    site_id UUID REFERENCES sites(id), -- NULL for study-level rates
    procedure_name VARCHAR(100) NOT NULL,
    procedure_code VARCHAR(50),
    procedure_description VARCHAR(500),
    rate DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    complexity_factor DECIMAL(3,2) DEFAULT 1.00,
    effective_date DATE NOT NULL,
    expiration_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_procedure_rates_study ON procedure_rates(study_id);
CREATE INDEX idx_procedure_rates_site ON procedure_rates(site_id);
CREATE INDEX idx_procedure_rates_procedure ON procedure_rates(procedure_name);
```

### site_payments
Individual site payment records with EDC integration.

```sql
CREATE TABLE site_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_reference VARCHAR(100) UNIQUE NOT NULL,
    study_id UUID NOT NULL REFERENCES studies(id),
    site_id UUID NOT NULL REFERENCES sites(id),
    visit_id UUID REFERENCES visits(id),
    participant_id UUID REFERENCES participants(id),
    payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN (
        'visit_based', 'procedure_based', 'milestone_based', 'expense_reimbursement'
    )),
    base_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    exchange_rate DECIMAL(10,6) DEFAULT 1.000000,
    local_amount DECIMAL(10,2) GENERATED ALWAYS AS (base_amount * exchange_rate) STORED,
    vat_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) GENERATED ALWAYS AS (local_amount + vat_amount) STORED,
    completed_procedures JSONB, -- List of completed procedures
    payment_date DATE,
    due_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'processing', 'approved', 'paid', 'disputed', 'cancelled'
    )),
    payment_method VARCHAR(50),
    transaction_reference VARCHAR(255),
    split_payments JSONB, -- For multiple payees
    holdback_amount DECIMAL(10,2) DEFAULT 0.00,
    triggered_by_edc BOOLEAN DEFAULT false,
    edc_trigger_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_site_payments_study ON site_payments(study_id);
CREATE INDEX idx_site_payments_site ON site_payments(site_id);
CREATE INDEX idx_site_payments_visit ON site_payments(visit_id);
CREATE INDEX idx_site_payments_status ON site_payments(status);
CREATE INDEX idx_site_payments_due_date ON site_payments(due_date);
CREATE INDEX idx_site_payments_edc_trigger ON site_payments(triggered_by_edc);
```

### payment_triggers
Automated payment trigger configurations.

```sql
CREATE TABLE payment_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id UUID NOT NULL REFERENCES studies(id),
    site_id UUID REFERENCES sites(id),
    trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN (
        'visit_completed', 'procedure_completed', 'milestone_achieved',
        'form_completed', 'data_locked', 'query_resolved'
    )),
    trigger_condition TEXT NOT NULL, -- SQL-like condition
    payment_calculation VARCHAR(100) NOT NULL CHECK (payment_calculation IN (
        'fixed_rate_per_visit', 'rate_per_procedure', 'milestone_percentage',
        'custom_formula'
    )),
    calculation_parameters JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_payment_triggers_study ON payment_triggers(study_id);
CREATE INDEX idx_payment_triggers_site ON payment_triggers(site_id);
CREATE INDEX idx_payment_triggers_type ON payment_triggers(trigger_type);
CREATE INDEX idx_payment_triggers_active ON payment_triggers(is_active);
```

### contract_versions
Robust version control for contracts and amendments.

```sql
CREATE TABLE contract_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_contract_id UUID NOT NULL REFERENCES contracts(id),
    amendment_id UUID REFERENCES contracts(id),
    version_number INTEGER NOT NULL,
    version_type VARCHAR(50) CHECK (version_type IN (
        'original', 'amendment', 'renewal', 'termination'
    )),
    changes_summary TEXT,
    approval_status VARCHAR(50) DEFAULT 'draft' CHECK (approval_status IN (
        'draft', 'under_review', 'approved', 'rejected', 'superseded'
    )),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    effective_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_contract_versions_parent ON contract_versions(parent_contract_id);
CREATE INDEX idx_contract_versions_amendment ON contract_versions(amendment_id);
CREATE INDEX idx_contract_versions_number ON contract_versions(version_number);
```

### budget_amendments
Budget changes associated with contract amendments.

```sql
CREATE TABLE budget_amendments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amendment_contract_id UUID NOT NULL REFERENCES contracts(id),
    original_budget_id UUID NOT NULL REFERENCES budgets(id),
    change_type VARCHAR(50) NOT NULL CHECK (change_type IN (
        'line_item_addition', 'line_item_removal', 'rate_change',
        'scope_change', 'currency_adjustment', 'other'
    )),
    change_amount DECIMAL(15,2),
    change_percentage DECIMAL(5,2),
    change_description TEXT NOT NULL,
    impact_analysis TEXT,
    approval_status VARCHAR(50) DEFAULT 'pending' CHECK (approval_status IN (
        'pending', 'approved', 'rejected'
    )),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_budget_amendments_amendment ON budget_amendments(amendment_contract_id);
CREATE INDEX idx_budget_amendments_budget ON budget_amendments(original_budget_id);
CREATE INDEX idx_budget_amendments_status ON budget_amendments(approval_status);
```

### exchange_rates
Real-time currency exchange rates for global operations.

```sql
CREATE TABLE exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_currency VARCHAR(3) NOT NULL,
    to_currency VARCHAR(3) NOT NULL,
    rate DECIMAL(10,6) NOT NULL,
    rate_date DATE NOT NULL,
    source VARCHAR(50) NOT NULL, -- e.g., 'xe.com', 'ecb', 'manual'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(from_currency, to_currency, rate_date)
);

CREATE INDEX idx_exchange_rates_currencies ON exchange_rates(from_currency, to_currency);
CREATE INDEX idx_exchange_rates_date ON exchange_rates(rate_date DESC);
CREATE INDEX idx_exchange_rates_active ON exchange_rates(is_active);
```

### analytics_cache
Cached analytics results for performance optimization.

```sql
CREATE TABLE analytics_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    level VARCHAR(50) NOT NULL CHECK (level IN ('portfolio', 'study', 'site', 'country')),
    entity_id UUID NOT NULL,
    filters JSONB,
    results JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    generated_by UUID NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_analytics_cache_key ON analytics_cache(cache_key);
CREATE INDEX idx_analytics_cache_level ON analytics_cache(level, entity_id);
CREATE INDEX idx_analytics_cache_expires ON analytics_cache(expires_at);
```

### budget_justifications
Custom library of budget justifications for negotiation support.

```sql
CREATE TABLE budget_justifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    category VARCHAR(100) NOT NULL,
    justification_title VARCHAR(255) NOT NULL,
    justification_text TEXT NOT NULL,
    supporting_data JSONB, -- Charts, references, benchmarks
    usage_count INTEGER DEFAULT 0,
    effectiveness_rating DECIMAL(3,2), -- User feedback on effectiveness
    tags VARCHAR(255)[], -- Searchable tags
    is_template BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_budget_justifications_organization ON budget_justifications(organization_id);
CREATE INDEX idx_budget_justifications_category ON budget_justifications(category);
CREATE INDEX idx_budget_justifications_tags ON budget_justifications USING GIN(tags);
CREATE INDEX idx_budget_justifications_template ON budget_justifications(is_template);
```

## Views for Advanced Analytics

### portfolio_financial_summary
Real-time portfolio-level financial overview.

```sql
CREATE VIEW portfolio_financial_summary AS
SELECT 
    o.id as organization_id,
    o.name as organization_name,
    COUNT(DISTINCT s.id) as active_studies,
    COUNT(DISTINCT st.id) as active_sites,
    SUM(b.total_budget) as total_committed_budget,
    SUM(CASE WHEN i.status = 'paid' THEN i.invoice_amount ELSE 0 END) as total_paid,
    SUM(CASE WHEN i.status IN ('draft', 'sent') THEN i.invoice_amount ELSE 0 END) as pending_invoices,
    AVG(EXTRACT(DAYS FROM (i.updated_at - i.created_at))) as avg_payment_cycle_days
FROM organizations o
LEFT JOIN studies s ON s.sponsor_organization_id = o.id
LEFT JOIN budgets b ON b.study_id = s.id AND b.status = 'approved'
LEFT JOIN invoices i ON i.study_id = s.id
LEFT JOIN sites st ON st.id IN (
    SELECT DISTINCT site_id FROM participants WHERE study_id = s.id
)
GROUP BY o.id, o.name;
```

### study_financial_performance
Study-level financial performance metrics.

```sql
CREATE VIEW study_financial_performance AS
SELECT 
    s.id as study_id,
    s.title as study_title,
    s.phase,
    COUNT(DISTINCT p.id) as enrolled_participants,
    COUNT(DISTINCT v.id) as completed_visits,
    SUM(b.total_budget) as total_budget,
    SUM(CASE WHEN sp.status = 'paid' THEN sp.total_amount ELSE 0 END) as total_payments_made,
    SUM(CASE WHEN sp.status = 'pending' THEN sp.total_amount ELSE 0 END) as pending_payments,
    (SUM(CASE WHEN sp.status = 'paid' THEN sp.total_amount ELSE 0 END) / NULLIF(SUM(b.total_budget), 0)) * 100 as budget_utilization_percent
FROM studies s
LEFT JOIN participants p ON p.study_id = s.id
LEFT JOIN visits v ON v.participant_id = p.id AND v.status = 'completed'
LEFT JOIN budgets b ON b.study_id = s.id AND b.status = 'approved'
LEFT JOIN site_payments sp ON sp.study_id = s.id
GROUP BY s.id, s.title, s.phase;
```
