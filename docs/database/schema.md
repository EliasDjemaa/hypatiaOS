# hypatiaOS Database Schema Documentation

## Overview

hypatiaOS uses a hybrid database approach:
- **PostgreSQL**: Relational data (users, studies, participants, audit logs)
- **MongoDB**: Document storage (protocols, forms, unstructured data)
- **Redis**: Caching and session management
- **S3-compatible**: Object storage for files and documents

## PostgreSQL Schema

### Core Tables

#### users
Primary user accounts and authentication data.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    organization_id UUID REFERENCES organizations(id),
    role VARCHAR(50) NOT NULL CHECK (role IN (
        -- System Level Roles
        'system_admin', 'compliance_officer', 'auditor',
        -- Sponsor Ecosystem Roles  
        'sponsor_admin', 'sponsor_clinical_lead', 'sponsor_regulatory', 
        'sponsor_finance_manager', 'sponsor_contract_manager',
        -- CRO Ecosystem Roles
        'cro_pm', 'cra', 'data_manager', 'cro_regulatory', 'cro_etmf_manager',
        'cro_finance_analyst', 'cro_contract_manager', 'cro_legal_officer',
        -- Site Ecosystem Roles
        'principal_investigator', 'site_coordinator', 'site_pharmacist', 
        'site_finance_coordinator',
        -- Legacy/Patient Roles
        'biostat', 'patient', 'admin'
    )),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
    last_login TIMESTAMP WITH TIME ZONE,
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_secret VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_role ON users(role);
```

#### organizations
Companies, hospitals, CROs, and other entities.

```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'sponsor', 'CRO', 'site', 'hospital', 'lab', 'regulator', 'vendor'
    )),
    address JSONB,
    contact JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID
);

-- Example address JSONB structure:
-- {
--   "street": "123 Main St",
--   "city": "Boston",
--   "state": "MA",
--   "zipCode": "02101",
--   "country": "USA"
-- }

-- Example contact JSONB structure:
-- {
--   "phone": "+1-555-0123",
--   "email": "contact@org.com",
--   "website": "https://org.com"
-- }
```

#### sites
Clinical trial sites within organizations.

```sql
CREATE TABLE sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    principal_investigator_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'closed')),
    country VARCHAR(3), -- ISO 3166-1 alpha-3
    region VARCHAR(100),
    timezone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID
);

CREATE INDEX idx_sites_organization ON sites(organization_id);
CREATE INDEX idx_sites_pi ON sites(principal_investigator_id);
```

#### studies
Clinical trial studies.

```sql
CREATE TABLE studies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_id VARCHAR(100) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    phase VARCHAR(20) CHECK (phase IN ('preclinical', 'phase_1', 'phase_2', 'phase_3', 'phase_4')),
    therapeutic_area VARCHAR(100),
    sponsor_id UUID NOT NULL REFERENCES organizations(id),
    start_date DATE,
    planned_end_date DATE,
    actual_end_date DATE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'terminated', 'suspended')),
    target_enrollment INTEGER,
    actual_enrollment INTEGER DEFAULT 0,
    metadata JSONB, -- endpoints, arms, eligibility summary
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID
);

-- Example metadata JSONB structure:
-- {
--   "primaryEndpoint": "Overall survival",
--   "secondaryEndpoints": ["Progression-free survival", "Safety"],
--   "arms": [
--     {"name": "Treatment", "description": "Drug X + Standard of Care"},
--     {"name": "Control", "description": "Placebo + Standard of Care"}
--   ],
--   "eligibility": {
--     "minAge": 18,
--     "maxAge": 75,
--     "gender": "all",
--     "conditions": ["Stage IV Cancer"]
--   }
-- }

CREATE INDEX idx_studies_sponsor ON studies(sponsor_id);
CREATE INDEX idx_studies_protocol ON studies(protocol_id);
CREATE INDEX idx_studies_status ON studies(status);
```

#### protocol_versions
Version control for study protocols.

```sql
CREATE TABLE protocol_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id UUID NOT NULL REFERENCES studies(id),
    version VARCHAR(20) NOT NULL,
    content JSONB, -- parsed protocol content
    document_id UUID, -- reference to document in eTMF
    effective_date DATE,
    change_log TEXT,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_protocol_versions_study ON protocol_versions(study_id);
CREATE INDEX idx_protocol_versions_version ON protocol_versions(study_id, version);
```

#### participants
Study participants/subjects.

```sql
CREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id UUID NOT NULL REFERENCES studies(id),
    site_id UUID NOT NULL REFERENCES sites(id),
    subject_identifier VARCHAR(50) NOT NULL, -- site-assigned pseudo-ID
    demographics JSONB, -- encrypted PII
    enrollment_date DATE,
    withdrawal_date DATE,
    completion_date DATE,
    status VARCHAR(20) DEFAULT 'screened' CHECK (status IN (
        'screened', 'enrolled', 'active', 'withdrawn', 'completed', 'discontinued'
    )),
    withdrawal_reason VARCHAR(100),
    consents JSONB, -- versioned consent information
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    
    UNIQUE(study_id, subject_identifier)
);

-- Example demographics JSONB (encrypted):
-- {
--   "dateOfBirth": "encrypted_value",
--   "gender": "Female",
--   "race": "White",
--   "ethnicity": "Not Hispanic or Latino"
-- }

-- Example consents JSONB:
-- {
--   "mainConsent": {
--     "version": "v2.0",
--     "signedDate": "2024-01-15",
--     "documentId": "uuid"
--   },
--   "genomicConsent": {
--     "version": "v1.0",
--     "signedDate": "2024-01-15",
--     "documentId": "uuid"
--   }
-- }

CREATE INDEX idx_participants_study ON participants(study_id);
CREATE INDEX idx_participants_site ON participants(site_id);
CREATE INDEX idx_participants_subject ON participants(subject_identifier);
CREATE INDEX idx_participants_status ON participants(status);
```

#### visits
Scheduled and completed participant visits.

```sql
CREATE TABLE visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID NOT NULL REFERENCES participants(id),
    study_id UUID NOT NULL REFERENCES studies(id),
    site_id UUID NOT NULL REFERENCES sites(id),
    visit_name VARCHAR(100) NOT NULL, -- e.g., "Screening", "Week 4 Follow-up"
    visit_number INTEGER,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    performed_at TIMESTAMP WITH TIME ZONE,
    visit_status VARCHAR(20) DEFAULT 'scheduled' CHECK (visit_status IN (
        'scheduled', 'in_progress', 'completed', 'missed', 'cancelled'
    )),
    visit_window_start DATE,
    visit_window_end DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID
);

CREATE INDEX idx_visits_participant ON visits(participant_id);
CREATE INDEX idx_visits_study ON visits(study_id);
CREATE INDEX idx_visits_scheduled ON visits(scheduled_at);
CREATE INDEX idx_visits_status ON visits(visit_status);
```

#### forms
CRF form definitions.

```sql
CREATE TABLE forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id UUID NOT NULL REFERENCES studies(id),
    name VARCHAR(255) NOT NULL,
    form_schema JSONB NOT NULL, -- field definitions, validations
    version VARCHAR(20) DEFAULT '1.0',
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'locked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    
    UNIQUE(study_id, name, version)
);

-- Example form_schema JSONB:
-- {
--   "fields": [
--     {
--       "name": "dateOfBirth",
--       "type": "date",
--       "label": "Date of Birth",
--       "required": true,
--       "validation": {
--         "min": "1900-01-01",
--         "max": "2010-12-31"
--       }
--     },
--     {
--       "name": "weight",
--       "type": "number",
--       "label": "Weight (kg)",
--       "required": true,
--       "validation": {
--         "min": 20,
--         "max": 300
--       }
--     }
--   ]
-- }

CREATE INDEX idx_forms_study ON forms(study_id);
CREATE INDEX idx_forms_name ON forms(study_id, name);
```

#### form_instances
Completed CRF forms with data.

```sql
CREATE TABLE form_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES forms(id),
    visit_id UUID NOT NULL REFERENCES visits(id),
    participant_id UUID NOT NULL REFERENCES participants(id),
    data JSONB NOT NULL, -- form field values
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'complete', 'locked', 'signed')),
    entered_by UUID NOT NULL REFERENCES users(id),
    entered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    locked_by UUID REFERENCES users(id),
    locked_at TIMESTAMP WITH TIME ZONE,
    signature JSONB, -- electronic signature data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Example data JSONB:
-- {
--   "dateOfBirth": "1985-03-15",
--   "weight": 68.5,
--   "height": 165,
--   "bloodPressure": {
--     "systolic": 120,
--     "diastolic": 80
--   }
-- }

CREATE INDEX idx_form_instances_form ON form_instances(form_id);
CREATE INDEX idx_form_instances_visit ON form_instances(visit_id);
CREATE INDEX idx_form_instances_participant ON form_instances(participant_id);
CREATE INDEX idx_form_instances_status ON form_instances(status);
```

#### observations
Individual data points from forms or external sources.

```sql
CREATE TABLE observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id UUID REFERENCES visits(id),
    participant_id UUID NOT NULL REFERENCES participants(id),
    form_instance_id UUID REFERENCES form_instances(id),
    field VARCHAR(100) NOT NULL,
    value TEXT,
    value_type VARCHAR(20) CHECK (value_type IN ('string', 'number', 'date', 'boolean', 'json')),
    unit VARCHAR(50),
    source VARCHAR(20) DEFAULT 'manual' CHECK (source IN ('manual', 'EHR', 'lab', 'device', 'calculated')),
    source_reference VARCHAR(255), -- external system reference
    flagged BOOLEAN DEFAULT false,
    query_id UUID, -- reference to data query if flagged
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID
);

CREATE INDEX idx_observations_participant ON observations(participant_id);
CREATE INDEX idx_observations_visit ON observations(visit_id);
CREATE INDEX idx_observations_field ON observations(field);
CREATE INDEX idx_observations_source ON observations(source);
CREATE INDEX idx_observations_flagged ON observations(flagged);
```

#### randomizations
Treatment arm assignments.

```sql
CREATE TABLE randomizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id UUID NOT NULL REFERENCES studies(id),
    participant_id UUID NOT NULL REFERENCES participants(id),
    arm VARCHAR(100) NOT NULL,
    stratum VARCHAR(100), -- stratification factor
    allocation_code VARCHAR(50),
    randomization_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    randomized_by UUID REFERENCES users(id),
    
    UNIQUE(participant_id) -- one randomization per participant
);

CREATE INDEX idx_randomizations_study ON randomizations(study_id);
CREATE INDEX idx_randomizations_participant ON randomizations(participant_id);
CREATE INDEX idx_randomizations_arm ON randomizations(arm);
```

#### inventory
Drug/device inventory tracking.

```sql
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id UUID NOT NULL REFERENCES studies(id),
    site_id UUID NOT NULL REFERENCES sites(id),
    product_code VARCHAR(100) NOT NULL,
    batch_number VARCHAR(100),
    expiration_date DATE,
    quantity_received INTEGER DEFAULT 0,
    quantity_dispensed INTEGER DEFAULT 0,
    quantity_returned INTEGER DEFAULT 0,
    quantity_destroyed INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'quarantine', 'expired', 'depleted')),
    temperature_log JSONB, -- temperature monitoring data
    shipment_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_inventory_study_site ON inventory(study_id, site_id);
CREATE INDEX idx_inventory_product ON inventory(product_code);
CREATE INDEX idx_inventory_batch ON inventory(batch_number);
CREATE INDEX idx_inventory_status ON inventory(status);
```

#### documents
Document metadata for eTMF.

```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id UUID REFERENCES studies(id),
    site_id UUID REFERENCES sites(id),
    doc_type VARCHAR(50) NOT NULL CHECK (doc_type IN (
        'protocol', 'consent', 'investigator_cv', 'lab_certification',
        'monitoring_report', 'correspondence', 'regulatory_submission',
        'case_report_form', 'source_document', 'other'
    )),
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255),
    storage_path VARCHAR(500) NOT NULL, -- S3 path
    file_size BIGINT,
    mime_type VARCHAR(100),
    checksum VARCHAR(64), -- SHA-256 hash
    version VARCHAR(20) DEFAULT '1.0',
    metadata JSONB, -- eTMF metadata
    tags TEXT[], -- searchable tags
    uploaded_by UUID NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    signature_info JSONB, -- electronic signature metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Example metadata JSONB:
-- {
--   "author": "Dr. John Smith",
--   "documentDate": "2024-01-15",
--   "version": "2.0",
--   "reviewedBy": "Jane Doe",
--   "approvedBy": "Medical Director",
--   "etmfSection": "8.2.1",
--   "retentionPeriod": "25 years"
-- }

CREATE INDEX idx_documents_study ON documents(study_id);
CREATE INDEX idx_documents_site ON documents(site_id);
CREATE INDEX idx_documents_type ON documents(doc_type);
CREATE INDEX idx_documents_uploaded ON documents(uploaded_at);
CREATE INDEX idx_documents_tags ON documents USING GIN(tags);
```

#### adverse_events
Adverse event reporting.

```sql
CREATE TABLE adverse_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id UUID NOT NULL REFERENCES studies(id),
    participant_id UUID NOT NULL REFERENCES participants(id),
    site_id UUID NOT NULL REFERENCES sites(id),
    ae_term VARCHAR(255) NOT NULL,
    meddra_code VARCHAR(20), -- MedDRA preferred term code
    severity VARCHAR(20) CHECK (severity IN ('mild', 'moderate', 'severe')),
    seriousness BOOLEAN DEFAULT false,
    outcome VARCHAR(50) CHECK (outcome IN ('recovered', 'recovering', 'not_recovered', 'fatal', 'unknown')),
    onset_date DATE NOT NULL,
    resolution_date DATE,
    related_to_study_drug BOOLEAN,
    action_taken VARCHAR(100),
    narrative TEXT,
    reporter_id UUID NOT NULL REFERENCES users(id),
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expedited_report_required BOOLEAN DEFAULT false,
    expedited_report_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_adverse_events_study ON adverse_events(study_id);
CREATE INDEX idx_adverse_events_participant ON adverse_events(participant_id);
CREATE INDEX idx_adverse_events_severity ON adverse_events(severity);
CREATE INDEX idx_adverse_events_serious ON adverse_events(seriousness);
CREATE INDEX idx_adverse_events_onset ON adverse_events(onset_date);
```

#### queries
Data queries and discrepancies.

```sql
CREATE TABLE queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id UUID NOT NULL REFERENCES studies(id),
    participant_id UUID REFERENCES participants(id),
    form_instance_id UUID REFERENCES form_instances(id),
    observation_id UUID REFERENCES observations(id),
    field_name VARCHAR(100),
    query_type VARCHAR(50) DEFAULT 'manual' CHECK (query_type IN ('manual', 'automatic', 'system')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'responded', 'resolved', 'cancelled')),
    message TEXT NOT NULL,
    response TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    responded_by UUID REFERENCES users(id),
    resolved_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    due_date DATE
);

CREATE INDEX idx_queries_study ON queries(study_id);
CREATE INDEX idx_queries_participant ON queries(participant_id);
CREATE INDEX idx_queries_status ON queries(status);
CREATE INDEX idx_queries_priority ON queries(priority);
CREATE INDEX idx_queries_assigned ON queries(assigned_to);
CREATE INDEX idx_queries_due ON queries(due_date);
```

#### audit_events
Comprehensive audit trail.

```sql
CREATE TABLE audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    object_type VARCHAR(100) NOT NULL,
    object_id UUID,
    actor_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL CHECK (action IN (
        'create', 'update', 'delete', 'sign', 'upload', 'download', 
        'randomize', 'lock', 'unlock', 'login', 'logout', 'password_change',
        'export', 'import', 'approve', 'reject'
    )),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    previous_value_hash VARCHAR(64), -- SHA-256 of previous state
    delta JSONB, -- what changed
    signature JSONB, -- cryptographic signature
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    reason TEXT -- reason for change
);

CREATE INDEX idx_audit_events_object ON audit_events(object_type, object_id);
CREATE INDEX idx_audit_events_actor ON audit_events(actor_id);
CREATE INDEX idx_audit_events_timestamp ON audit_events(timestamp);
CREATE INDEX idx_audit_events_action ON audit_events(action);
```

#### tasks
Task management and workflow.

```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id UUID REFERENCES studies(id),
    participant_id UUID REFERENCES participants(id),
    assignee_id UUID REFERENCES users(id),
    created_by UUID NOT NULL REFERENCES users(id),
    task_type VARCHAR(50) NOT NULL CHECK (task_type IN (
        'monitor_visit', 'query_resolution', 'document_upload', 'data_entry',
        'consent_renewal', 'adverse_event_followup', 'protocol_deviation'
    )),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB, -- task-specific data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tasks_study ON tasks(study_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due ON tasks(due_date);
CREATE INDEX idx_tasks_type ON tasks(task_type);
```

### Financial & Contract Lifecycle Management (FCLM) Tables

#### contracts
Master service agreements, study contracts, and amendments.

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
    site_id UUID REFERENCES sites(id),
    parent_contract_id UUID REFERENCES contracts(id), -- for amendments
    title VARCHAR(500) NOT NULL,
    description TEXT,
    contract_value DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'under_review', 'negotiating', 'pending_signature', 
        'executed', 'active', 'completed', 'terminated', 'expired'
    )),
    effective_date DATE,
    expiration_date DATE,
    auto_renew BOOLEAN DEFAULT false,
    renewal_period_months INTEGER,
    signed_date TIMESTAMP WITH TIME ZONE,
    document_url VARCHAR(500), -- S3 path to signed contract
    esignature_envelope_id VARCHAR(255), -- DocuSign/Adobe envelope ID
    ai_risk_score DECIMAL(3,2), -- 0.00-1.00 risk assessment
    ai_risk_factors JSONB, -- AI-detected risk factors
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_contracts_sponsor ON contracts(sponsor_organization_id);
CREATE INDEX idx_contracts_cro ON contracts(cro_organization_id);
CREATE INDEX idx_contracts_study ON contracts(study_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_type ON contracts(contract_type);
```

#### contract_clauses
Individual contract clauses with AI risk analysis.

```sql
CREATE TABLE contract_clauses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    clause_number VARCHAR(20) NOT NULL,
    clause_type VARCHAR(100) NOT NULL CHECK (clause_type IN (
        'payment_terms', 'deliverables', 'timeline', 'liability', 
        'indemnification', 'termination', 'intellectual_property', 
        'confidentiality', 'compliance', 'force_majeure', 'other'
    )),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    ai_risk_score DECIMAL(3,2), -- AI-assessed risk level
    ai_risk_category VARCHAR(100), -- e.g., 'payment_delay_risk', 'liability_exposure'
    ai_suggestions TEXT, -- AI-generated improvement suggestions
    negotiation_status VARCHAR(50) DEFAULT 'accepted' CHECK (negotiation_status IN (
        'accepted', 'under_negotiation', 'disputed', 'resolved'
    )),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_contract_clauses_contract ON contract_clauses(contract_id);
CREATE INDEX idx_contract_clauses_type ON contract_clauses(clause_type);
CREATE INDEX idx_contract_clauses_risk ON contract_clauses(ai_risk_score DESC);
```

#### budgets
Study and site-level budgets with milestone-based payment structures.

```sql
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_number VARCHAR(50) UNIQUE NOT NULL,
    contract_id UUID NOT NULL REFERENCES contracts(id),
    study_id UUID NOT NULL REFERENCES studies(id),
    site_id UUID REFERENCES sites(id), -- NULL for study-level budgets
    budget_type VARCHAR(50) NOT NULL CHECK (budget_type IN (
        'study_level', 'site_level', 'pass_through', 'startup', 'closeout'
    )),
    total_budget DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'submitted', 'approved', 'active', 'completed', 'cancelled'
    )),
    budget_period_start DATE NOT NULL,
    budget_period_end DATE NOT NULL,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_budgets_contract ON budgets(contract_id);
CREATE INDEX idx_budgets_study ON budgets(study_id);
CREATE INDEX idx_budgets_site ON budgets(site_id);
CREATE INDEX idx_budgets_status ON budgets(status);
```

#### budget_line_items
Individual budget components tied to operational milestones.

```sql
CREATE TABLE budget_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    line_item_number VARCHAR(20) NOT NULL,
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
    milestone_trigger VARCHAR(200), -- e.g., 'first_patient_in', 'site_activation', 'database_lock'
    milestone_percentage DECIMAL(5,2) DEFAULT 100.00, -- % of amount payable at milestone
    is_invoiceable BOOLEAN DEFAULT true,
    invoice_schedule VARCHAR(50) DEFAULT 'upon_completion' CHECK (invoice_schedule IN (
        'upon_completion', 'monthly', 'quarterly', 'upfront', 'custom'
    )),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_budget_line_items_budget ON budget_line_items(budget_id);
CREATE INDEX idx_budget_line_items_category ON budget_line_items(category);
CREATE INDEX idx_budget_line_items_milestone ON budget_line_items(milestone_trigger);
```

#### invoices
Generated invoices based on completed milestones.

```sql
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    budget_line_item_id UUID NOT NULL REFERENCES budget_line_items(id),
    contract_id UUID NOT NULL REFERENCES contracts(id),
    study_id UUID NOT NULL REFERENCES studies(id),
    site_id UUID REFERENCES sites(id),
    invoice_type VARCHAR(50) NOT NULL CHECK (invoice_type IN (
        'milestone', 'recurring', 'expense_reimbursement', 'adjustment', 'credit_memo'
    )),
    invoice_amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    tax_amount DECIMAL(15,2) DEFAULT 0.00,
    total_amount DECIMAL(15,2) GENERATED ALWAYS AS (invoice_amount + tax_amount) STORED,
    milestone_completed_at TIMESTAMP WITH TIME ZONE, -- when triggering milestone was completed
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'sent', 'viewed', 'approved', 'paid', 'overdue', 'disputed', 'cancelled'
    )),
    payment_terms_days INTEGER DEFAULT 30,
    notes TEXT,
    document_url VARCHAR(500), -- S3 path to PDF invoice
    external_invoice_id VARCHAR(100), -- ERP system reference
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_invoices_budget_line_item ON invoices(budget_line_item_id);
CREATE INDEX idx_invoices_contract ON invoices(contract_id);
CREATE INDEX idx_invoices_study ON invoices(study_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
```

#### payments
Payment tracking and reconciliation.

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_reference VARCHAR(100) UNIQUE NOT NULL,
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN (
        'bank_transfer', 'ach', 'wire', 'check', 'credit_card', 'other'
    )),
    payment_amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    exchange_rate DECIMAL(10,6) DEFAULT 1.000000,
    payment_date DATE NOT NULL,
    received_date DATE,
    bank_reference VARCHAR(100),
    transaction_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'
    )),
    reconciliation_status VARCHAR(50) DEFAULT 'unreconciled' CHECK (reconciliation_status IN (
        'unreconciled', 'reconciled', 'disputed', 'adjusted'
    )),
    reconciled_by UUID REFERENCES users(id),
    reconciled_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_payments_reconciliation ON payments(reconciliation_status);
```

#### milestone_events
Tracks operational events that trigger financial milestones.

```sql
CREATE TABLE milestone_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL CHECK (event_type IN (
        'study_startup', 'site_activation', 'first_patient_in', 'last_patient_in',
        'first_patient_last_visit', 'database_lock', 'study_closeout',
        'enrollment_milestone', 'visit_completion', 'monitoring_visit'
    )),
    study_id UUID NOT NULL REFERENCES studies(id),
    site_id UUID REFERENCES sites(id),
    participant_id UUID REFERENCES participants(id),
    visit_id UUID REFERENCES visits(id),
    event_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    event_data JSONB, -- Additional event-specific data
    triggered_by_user_id UUID REFERENCES users(id),
    processed_for_billing BOOLEAN DEFAULT false,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_milestone_events_type ON milestone_events(event_type);
CREATE INDEX idx_milestone_events_study ON milestone_events(study_id);
CREATE INDEX idx_milestone_events_site ON milestone_events(site_id);
CREATE INDEX idx_milestone_events_date ON milestone_events(event_date);
CREATE INDEX idx_milestone_events_billing ON milestone_events(processed_for_billing);
```

#### financial_audit_logs
Comprehensive audit trail for all financial operations.

```sql
CREATE TABLE financial_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL CHECK (event_type IN (
        'contract_created', 'contract_updated', 'contract_signed', 'contract_terminated',
        'budget_created', 'budget_approved', 'budget_modified',
        'invoice_generated', 'invoice_sent', 'invoice_paid', 'invoice_disputed',
        'payment_received', 'payment_reconciled', 'milestone_triggered'
    )),
    object_type VARCHAR(50) NOT NULL CHECK (object_type IN (
        'contract', 'budget', 'budget_line_item', 'invoice', 'payment', 'milestone_event'
    )),
    object_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id UUID NOT NULL REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reason TEXT
);

CREATE INDEX idx_financial_audit_logs_type ON financial_audit_logs(event_type);
CREATE INDEX idx_financial_audit_logs_object ON financial_audit_logs(object_type, object_id);
CREATE INDEX idx_financial_audit_logs_user ON financial_audit_logs(user_id);
CREATE INDEX idx_financial_audit_logs_timestamp ON financial_audit_logs(timestamp);
```

## MongoDB Collections

### protocols
Full protocol documents and parsed content.

```javascript
{
  _id: ObjectId,
  studyId: "uuid",
  version: "2.0",
  documentId: "uuid", // reference to PostgreSQL documents table
  content: {
    title: "Phase II Study of Drug X",
    objectives: {
      primary: "Assess efficacy...",
      secondary: ["Safety", "Pharmacokinetics"]
    },
    eligibility: {
      inclusion: [
        "Age >= 18 years",
        "Confirmed diagnosis"
      ],
      exclusion: [
        "Pregnant or nursing",
        "Prior therapy within 30 days"
      ]
    },
    visitSchedule: [
      {
        visit: "Screening",
        window: "Day -28 to -1",
        procedures: ["Consent", "Medical History", "Physical Exam"]
      }
    ],
    endpoints: {
      primary: {
        name: "Overall Response Rate",
        definition: "Complete or partial response per RECIST 1.1"
      }
    }
  },
  aiExtracted: {
    confidence: 0.95,
    extractedAt: ISODate,
    extractedBy: "ai-engine-v1.0"
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### form_schemas
Complex form definitions with conditional logic.

```javascript
{
  _id: ObjectId,
  formId: "uuid", // reference to PostgreSQL forms table
  studyId: "uuid",
  name: "Adverse Event Form",
  schema: {
    sections: [
      {
        name: "Event Details",
        fields: [
          {
            name: "aeTerm",
            type: "text",
            label: "Adverse Event Term",
            required: true,
            validation: {
              maxLength: 255
            }
          },
          {
            name: "severity",
            type: "select",
            label: "Severity",
            options: ["Mild", "Moderate", "Severe"],
            required: true
          }
        ]
      }
    ],
    conditionalLogic: [
      {
        condition: "severity === 'Severe'",
        action: "show",
        target: "seriousAeSection"
      }
    ],
    calculations: [
      {
        field: "durationDays",
        formula: "dateDiff(resolutionDate, onsetDate)"
      }
    ]
  },
  version: "1.0",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### ai_analysis
AI-generated insights and analysis.

```javascript
{
  _id: ObjectId,
  studyId: "uuid",
  analysisType: "anomaly_detection",
  input: {
    formInstanceId: "uuid",
    data: { /* form data */ }
  },
  output: {
    anomalies: [
      {
        field: "weight",
        type: "outlier",
        confidence: 0.87,
        message: "Weight value appears to be an outlier",
        suggestedAction: "verify_measurement"
      }
    ],
    confidence: 0.87
  },
  model: {
    name: "anomaly-detector-v2.1",
    version: "2.1.0"
  },
  createdAt: ISODate
}
```

### integration_logs
External system integration logs.

```javascript
{
  _id: ObjectId,
  studyId: "uuid",
  integrationType: "fhir",
  direction: "inbound", // inbound or outbound
  source: "hospital-ehr",
  messageId: "msg-12345",
  payload: {
    resourceType: "Observation",
    // ... FHIR resource
  },
  mappingResult: {
    success: true,
    participantId: "uuid",
    observationId: "uuid",
    warnings: []
  },
  processingTime: 245, // milliseconds
  createdAt: ISODate
}
```

## Redis Schema

### Session Management
```
user_session:{userId} -> {
  userId: "uuid",
  email: "user@example.com",
  role: "site_coordinator",
  organizationId: "uuid",
  lastActivity: "2024-01-15T10:30:00Z",
  permissions: ["participants.read", "forms.create"]
}
TTL: 24 hours
```

### Cache Keys
```
study:{studyId}:participants -> [participant objects]
TTL: 1 hour

form:{formId}:schema -> {form schema object}
TTL: 4 hours

user:{userId}:permissions -> ["permission1", "permission2"]
TTL: 1 hour

query_count:{studyId}:{date} -> number
TTL: 24 hours
```

### Rate Limiting
```
rate_limit:auth:{ip} -> request_count
TTL: 15 minutes

rate_limit:api:{userId} -> request_count
TTL: 1 hour
```

## Data Relationships

```
organizations (1) -> (n) sites
organizations (1) -> (n) studies (as sponsor)
sites (1) -> (n) participants
studies (1) -> (n) participants
studies (1) -> (n) forms
participants (1) -> (n) visits
visits (1) -> (n) form_instances
forms (1) -> (n) form_instances
form_instances (1) -> (n) observations
participants (1) -> (n) adverse_events
participants (1) -> (1) randomizations
studies (1) -> (n) documents
studies (1) -> (n) inventory
```

## Backup and Recovery

### PostgreSQL
- Daily full backups
- Point-in-time recovery enabled
- Write-ahead logging (WAL) archiving
- Replica for read queries

### MongoDB
- Daily backups with mongodump
- Replica set with 3 nodes
- Oplog for point-in-time recovery

### Redis
- RDB snapshots every 6 hours
- AOF (Append Only File) enabled
- Redis Sentinel for high availability

## Performance Considerations

### Indexing Strategy
- Primary keys on all tables
- Foreign key indexes
- Composite indexes for common query patterns
- Partial indexes for filtered queries

### Partitioning
- `audit_events` partitioned by month
- `observations` partitioned by study_id
- Large tables archived after study completion

### Query Optimization
- Use prepared statements
- Limit result sets with pagination
- Cache frequently accessed data in Redis
- Use connection pooling

## Security

### Encryption
- Data at rest: AES-256 encryption
- Data in transit: TLS 1.2+
- PII fields: Application-level encryption
- Database connections: SSL required

### Access Control
- Database users with minimal privileges
- Application-level RBAC
- Audit all data access
- Regular security reviews

### Compliance
- 21 CFR Part 11: Electronic signatures and audit trails
- HIPAA: PHI protection and access controls
- GDPR: Data subject rights and retention policies
- GCP: Good Clinical Practice compliance
