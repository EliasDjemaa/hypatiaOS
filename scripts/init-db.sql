-- hypatiaOS Database Initialization Script
-- This script creates the essential tables for testing

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('sponsor', 'cro', 'site', 'vendor')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table with expanded financial roles
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    organization_id UUID REFERENCES organizations(id),
    role VARCHAR(50) NOT NULL CHECK (role IN (
        'system_admin', 'compliance_officer', 'auditor',
        'sponsor_admin', 'sponsor_clinical_lead', 'sponsor_regulatory', 
        'sponsor_finance_manager', 'sponsor_contract_manager',
        'cro_pm', 'cra', 'data_manager', 'cro_regulatory', 'cro_etmf_manager',
        'cro_finance_analyst', 'cro_contract_manager', 'cro_legal_officer',
        'principal_investigator', 'site_coordinator', 'site_pharmacist', 
        'site_finance_coordinator', 'biostat', 'patient', 'admin'
    )),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Studies table
CREATE TABLE IF NOT EXISTS studies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    phase VARCHAR(20),
    therapeutic_area VARCHAR(100),
    sponsor_organization_id UUID REFERENCES organizations(id),
    status VARCHAR(50) DEFAULT 'planning',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sites table
CREATE TABLE IF NOT EXISTS sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    organization_id UUID REFERENCES organizations(id),
    country VARCHAR(3),
    currency VARCHAR(3) DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contracts table (Financial Operations)
CREATE TABLE IF NOT EXISTS contracts (
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
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'under_review', 'negotiating', 'pending_signature', 
        'executed', 'active', 'completed', 'terminated', 'expired'
    )),
    effective_date DATE,
    expiration_date DATE,
    ai_risk_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id)
);

-- Budgets table (Financial Operations)
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_number VARCHAR(50) UNIQUE NOT NULL,
    contract_id UUID NOT NULL REFERENCES contracts(id),
    study_id UUID NOT NULL REFERENCES studies(id),
    site_id UUID REFERENCES sites(id),
    budget_type VARCHAR(50) NOT NULL CHECK (budget_type IN (
        'study_level', 'site_level', 'pass_through', 'startup', 'closeout'
    )),
    total_budget DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'submitted', 'approved', 'active', 'completed', 'cancelled'
    )),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id)
);

-- Budget Line Items table
CREATE TABLE IF NOT EXISTS budget_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    line_item_number VARCHAR(10) NOT NULL,
    category VARCHAR(100) NOT NULL CHECK (category IN (
        'startup', 'enrollment', 'visits', 'procedures', 'monitoring',
        'data_management', 'closeout', 'pass_through', 'other'
    )),
    description VARCHAR(500) NOT NULL,
    unit_type VARCHAR(50) CHECK (unit_type IN (
        'fixed', 'per_participant', 'per_visit', 'per_procedure',
        'per_month', 'per_milestone', 'hourly'
    )),
    unit_rate DECIMAL(10,2) NOT NULL,
    estimated_units INTEGER DEFAULT 1,
    total_amount DECIMAL(15,2) GENERATED ALWAYS AS (unit_rate * estimated_units) STORED,
    milestone_trigger VARCHAR(200),
    milestone_percentage DECIMAL(5,2) DEFAULT 100.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices table (Financial Operations)
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    study_id UUID NOT NULL REFERENCES studies(id),
    site_id UUID REFERENCES sites(id),
    budget_line_item_id UUID REFERENCES budget_line_items(id),
    invoice_amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'sent', 'approved', 'paid', 'overdue', 'disputed', 'cancelled'
    )),
    due_date DATE NOT NULL,
    milestone_trigger VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id)
);

-- Site Payments table (Financial Operations)
CREATE TABLE IF NOT EXISTS site_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_reference VARCHAR(100) UNIQUE NOT NULL,
    study_id UUID NOT NULL REFERENCES studies(id),
    site_id UUID NOT NULL REFERENCES sites(id),
    payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN (
        'visit_based', 'procedure_based', 'milestone_based', 'expense_reimbursement'
    )),
    base_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    exchange_rate DECIMAL(10,6) DEFAULT 1.000000,
    local_amount DECIMAL(10,2) GENERATED ALWAYS AS (base_amount * exchange_rate) STORED,
    vat_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) GENERATED ALWAYS AS (local_amount + vat_amount) STORED,
    due_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'processing', 'approved', 'paid', 'disputed', 'cancelled'
    )),
    triggered_by_edc BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id)
);

-- Financial Audit Logs table
CREATE TABLE IF NOT EXISTS financial_audit_logs (
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

-- Insert demo organizations
INSERT INTO organizations (id, name, type) VALUES 
    ('11111111-1111-1111-1111-111111111111', 'BioPharma Corp', 'sponsor'),
    ('22222222-2222-2222-2222-222222222222', 'Global CRO Solutions', 'cro'),
    ('33333333-3333-3333-3333-333333333333', 'Metropolitan Medical Center', 'site'),
    ('44444444-4444-4444-4444-444444444444', 'Regional Research Partners', 'cro')
ON CONFLICT (id) DO NOTHING;

-- Insert demo users with financial roles
INSERT INTO users (id, email, hashed_password, display_name, organization_id, role) VALUES 
    -- System Level
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin@hypatia-os.com', '$2b$10$rQZ5ZqZ5ZqZ5ZqZ5ZqZ5ZuZ5ZqZ5ZqZ5ZqZ5ZqZ5ZqZ5ZqZ5ZqZ5Zq', 'System Administrator', NULL, 'system_admin'),
    
    -- Sponsor Users
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'sponsor.finance@demo.com', '$2b$10$rQZ5ZqZ5ZqZ5ZqZ5ZqZ5ZuZ5ZqZ5ZqZ5ZqZ5ZqZ5ZqZ5ZqZ5ZqZ5Zq', 'Sarah Johnson', '11111111-1111-1111-1111-111111111111', 'sponsor_finance_manager'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'sponsor.contracts@demo.com', '$2b$10$rQZ5ZqZ5ZqZ5ZqZ5ZqZ5ZuZ5ZqZ5ZqZ5ZqZ5ZqZ5ZqZ5ZqZ5ZqZ5Zq', 'Michael Chen', '11111111-1111-1111-1111-111111111111', 'sponsor_contract_manager'),
    
    -- CRO Users
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'cro.finance@demo.com', '$2b$10$rQZ5ZqZ5ZqZ5ZqZ5ZqZ5ZuZ5ZqZ5ZqZ5ZqZ5ZqZ5ZqZ5ZqZ5ZqZ5Zq', 'Emily Rodriguez', '22222222-2222-2222-2222-222222222222', 'cro_finance_analyst'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'cro.contracts@demo.com', '$2b$10$rQZ5ZqZ5ZqZ5ZqZ5ZqZ5ZuZ5ZqZ5ZqZ5ZqZ5ZqZ5ZqZ5ZqZ5ZqZ5Zq', 'David Wilson', '22222222-2222-2222-2222-222222222222', 'cro_contract_manager'),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'cro.legal@demo.com', '$2b$10$rQZ5ZqZ5ZqZ5ZqZ5ZqZ5ZuZ5ZqZ5ZqZ5ZqZ5ZqZ5ZqZ5ZqZ5ZqZ5Zq', 'Jennifer Lee', '22222222-2222-2222-2222-222222222222', 'cro_legal_officer'),
    
    -- Site Users
    ('gggggggg-gggg-gggg-gggg-gggggggggggg', 'site.finance@demo.com', '$2b$10$rQZ5ZqZ5ZqZ5ZqZ5ZqZ5ZuZ5ZqZ5ZqZ5ZqZ5ZqZ5ZqZ5ZqZ5ZqZ5Zq', 'Lisa Thompson', '33333333-3333-3333-3333-333333333333', 'site_finance_coordinator'),
    ('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'site.coordinator@demo.com', '$2b$10$rQZ5ZqZ5ZqZ5ZqZ5ZqZ5ZuZ5ZqZ5ZqZ5ZqZ5ZqZ5ZqZ5ZqZ5ZqZ5Zq', 'Robert Martinez', '33333333-3333-3333-3333-333333333333', 'site_coordinator'),
    
    -- Demo User
    ('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'demo@hypatia-os.com', '$2b$10$rQZ5ZqZ5ZqZ5ZqZ5ZqZ5ZuZ5ZqZ5ZqZ5ZqZ5ZqZ5ZqZ5ZqZ5ZqZ5Zq', 'Demo User', '22222222-2222-2222-2222-222222222222', 'cro_finance_analyst')
ON CONFLICT (id) DO NOTHING;

-- Insert demo studies
INSERT INTO studies (id, title, phase, therapeutic_area, sponsor_organization_id) VALUES 
    ('study001-1111-1111-1111-111111111111', 'Phase III Oncology Study - ONCX-301', 'III', 'Oncology', '11111111-1111-1111-1111-111111111111'),
    ('study002-2222-2222-2222-222222222222', 'Cardiovascular Device Trial - CVD-205', 'III', 'Cardiology', '11111111-1111-1111-1111-111111111111'),
    ('study003-3333-3333-3333-333333333333', 'Diabetes Management Study - DM-401', 'II', 'Endocrinology', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;

-- Insert demo sites
INSERT INTO sites (id, name, organization_id, country, currency) VALUES 
    ('site0001-1111-1111-1111-111111111111', 'Metropolitan Medical Center - Main', '33333333-3333-3333-3333-333333333333', 'USA', 'USD'),
    ('site0002-2222-2222-2222-222222222222', 'European Research Institute', '33333333-3333-3333-3333-333333333333', 'DEU', 'EUR'),
    ('site0003-3333-3333-3333-333333333333', 'London Clinical Research', '33333333-3333-3333-3333-333333333333', 'GBR', 'GBP')
ON CONFLICT (id) DO NOTHING;

-- Insert demo contracts
INSERT INTO contracts (id, contract_number, contract_type, sponsor_organization_id, cro_organization_id, study_id, title, contract_value, status, ai_risk_score, created_by) VALUES 
    ('contract1-1111-1111-1111-111111111111', 'MSA-2024-0001', 'study_contract', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'study001-1111-1111-1111-111111111111', 'Phase III Oncology Study Contract', 2500000.00, 'active', 0.34, 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
    ('contract2-2222-2222-2222-222222222222', 'SC-2024-0012', 'study_contract', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'study002-2222-2222-2222-222222222222', 'Cardiovascular Device Trial Contract', 1800000.00, 'negotiating', 0.58, 'cccccccc-cccc-cccc-cccc-cccccccccccc')
ON CONFLICT (id) DO NOTHING;

-- Insert demo budgets
INSERT INTO budgets (id, budget_number, contract_id, study_id, budget_type, total_budget, status, created_by) VALUES 
    ('budget01-1111-1111-1111-111111111111', 'SB-2024-0001', 'contract1-1111-1111-1111-111111111111', 'study001-1111-1111-1111-111111111111', 'study_level', 2500000.00, 'approved', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
    ('budget02-2222-2222-2222-222222222222', 'SB-2024-0002', 'contract2-2222-2222-2222-222222222222', 'study002-2222-2222-2222-222222222222', 'study_level', 1800000.00, 'draft', 'dddddddd-dddd-dddd-dddd-dddddddddddd')
ON CONFLICT (id) DO NOTHING;

-- Insert demo budget line items
INSERT INTO budget_line_items (budget_id, line_item_number, category, description, unit_type, unit_rate, estimated_units, milestone_trigger) VALUES 
    ('budget01-1111-1111-1111-111111111111', '001', 'startup', 'Study Startup Activities', 'fixed', 50000.00, 1, 'study_activation'),
    ('budget01-1111-1111-1111-111111111111', '002', 'enrollment', 'Patient Enrollment', 'per_participant', 5000.00, 300, 'enrollment_milestone'),
    ('budget01-1111-1111-1111-111111111111', '003', 'visits', 'Visit Conduct', 'per_visit', 800.00, 1200, 'visit_completion'),
    ('budget01-1111-1111-1111-111111111111', '004', 'closeout', 'Study Closeout', 'fixed', 75000.00, 1, 'study_completion')
ON CONFLICT DO NOTHING;

-- Insert demo invoices
INSERT INTO invoices (id, invoice_number, study_id, budget_line_item_id, invoice_amount, status, due_date, milestone_trigger, created_by) VALUES 
    ('invoice1-1111-1111-1111-111111111111', 'INV-2024-0001', 'study001-1111-1111-1111-111111111111', (SELECT id FROM budget_line_items WHERE line_item_number = '001' LIMIT 1), 50000.00, 'paid', '2024-02-15', 'study_activation', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
    ('invoice2-2222-2222-2222-222222222222', 'INV-2024-0002', 'study001-1111-1111-1111-111111111111', (SELECT id FROM budget_line_items WHERE line_item_number = '002' LIMIT 1), 125000.00, 'sent', '2024-03-01', 'enrollment_milestone', 'dddddddd-dddd-dddd-dddd-dddddddddddd')
ON CONFLICT (id) DO NOTHING;

-- Insert demo site payments
INSERT INTO site_payments (id, payment_reference, study_id, site_id, payment_type, base_amount, currency, status, due_date, triggered_by_edc, created_by) VALUES 
    ('payment1-1111-1111-1111-111111111111', 'PAY-2024-0001', 'study001-1111-1111-1111-111111111111', 'site0001-1111-1111-1111-111111111111', 'visit_based', 800.00, 'USD', 'paid', '2024-02-20', true, 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
    ('payment2-2222-2222-2222-222222222222', 'PAY-2024-0002', 'study001-1111-1111-1111-111111111111', 'site0002-2222-2222-2222-222222222222', 'visit_based', 680.00, 'EUR', 'pending', '2024-03-05', true, 'dddddddd-dddd-dddd-dddd-dddddddddddd')
ON CONFLICT (id) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contracts_sponsor ON contracts(sponsor_organization_id);
CREATE INDEX IF NOT EXISTS idx_contracts_cro ON contracts(cro_organization_id);
CREATE INDEX IF NOT EXISTS idx_contracts_study ON contracts(study_id);
CREATE INDEX IF NOT EXISTS idx_budgets_contract ON budgets(contract_id);
CREATE INDEX IF NOT EXISTS idx_budgets_study ON budgets(study_id);
CREATE INDEX IF NOT EXISTS idx_invoices_study ON invoices(study_id);
CREATE INDEX IF NOT EXISTS idx_site_payments_study ON site_payments(study_id);
CREATE INDEX IF NOT EXISTS idx_site_payments_site ON site_payments(site_id);
CREATE INDEX IF NOT EXISTS idx_financial_audit_logs_object ON financial_audit_logs(object_type, object_id);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
