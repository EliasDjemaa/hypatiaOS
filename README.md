# hypatiaOS - Clinical Research Business Platform

## 🧠 Unified Clinical Trial Financial Orchestration Platform

hypatiaOS is a **Clinical Trial Operating System** — a unified, AI-driven financial orchestration platform for Sponsors, CROs, and Sites. Our goal is to automate everything from contract negotiation to final site payment across global, multi-currency, multi-jurisdictional studies.

We're building the infrastructure to eliminate disconnected systems and manual handoffs by integrating:
- **EDC** (Electronic Data Capture)
- **CTMS** (Clinical Trial Management System) 
- **eTMF** (Trial Master File)
- **IRT** (Randomization/Tracking)
- **Financial Operations** (Contracts → Budgets → Payments)

All inside one intelligent, compliant ecosystem.

### 🎯 **Our North Star**
**"Zero manual steps between contract and payment."**

### 🌟 **Vision: Industry-First Capabilities**
- **Complete Clinical + Financial Integration**: Seamless workflow from EDC events to automated payments
- **AI-Powered Financial Intelligence**: Contract risk assessment, predictive cost modeling, and real-time analytics  
- **Global Multi-Currency Operations**: Support for 150+ currencies with local tax compliance
- **Real-Time Automation**: Event-driven workflows that eliminate manual processes
- **Enterprise-Grade Compliance**: 21 CFR Part 11, GDPR, SOX, and GCP compliant

## Architecture

### System Principles
- **Modular Microservices**: Each service has a single responsibility
- **Event-Driven**: Asynchronous communication via Kafka
- **Standards Compliant**: FHIR/HL7 integration, CDISC output
- **Audit-First**: Immutable logs for 21 CFR Part 11 compliance
- **RBAC + Consent**: Role-based access with consent-first data handling

### Technology Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Node.js + Python microservices, FastAPI, GraphQL, PostgreSQL |
| **Messaging** | Kafka / RabbitMQ |
| **Cache** | Redis |
| **Frontend** | React + TypeScript + Material-UI + Custom UI Components |
| **Infrastructure** | Docker + Kubernetes (AWS/GCP), CI/CD via GitHub Actions |
| **Monitoring** | Grafana, Prometheus, OpenTelemetry |
| **Security** | Vault for secrets, JWT + OAuth2.0 RBAC, AES-256 encryption |

## Project Structure

```
hypatiaOS/
├── services/                    # Microservices Architecture
│   ├── auth-service/           # Authentication & Authorization (Port: 3001)
│   ├── study-management/       # CTMS Core (Port: 3002)
│   ├── edc-engine/            # Electronic Data Capture (Port: 3003)
│   ├── etmf-service/          # Document Management (Port: 3004)
│   ├── contract-service/       # Contract Lifecycle Management (Port: 3005)
│   ├── budget-service/         # Budget Management & Forecasting (Port: 3006)
│   ├── invoice-service/        # Invoice Generation & Tracking (Port: 3007)
│   ├── payment-service/        # Multi-Currency Payment Processing (Port: 3008)
│   ├── financial-orchestrator/ # Financial Workflow Engine (Port: 3009)
│   ├── ai-engine/             # AI Risk Assessment & Forecasting (Port: 3012)
│   ├── analytics-service/      # Real-Time Financial Analytics (Port: 3014)
│   ├── notification-service/   # Multi-Channel Messaging (Port: 3015)
│   ├── audit-service/         # Compliance & Audit Trails (Port: 3016)
│   └── integration-gateway/    # External API Integration (Port: 3017)
├── web-app/                   # React Frontend Application
├── mobile-app/                # React Native Patient App
├── infrastructure/            # Kubernetes & Docker Configurations
│   ├── k8s/                   # Kubernetes manifests
│   ├── docker/                # Docker configurations
│   └── monitoring/            # Prometheus, Grafana configs
├── schemas/                   # Database & API Schemas
│   ├── database/              # PostgreSQL schemas
│   ├── api/                   # OpenAPI specifications
│   └── events/                # Kafka event schemas
├── docs/                      # Comprehensive Documentation
│   ├── api/                   # API documentation
│   ├── database/              # Database documentation
│   ├── financial/             # Financial operations guides
│   ├── compliance/            # Regulatory compliance docs
│   └── deployment/            # Deployment guides
├── scripts/                   # Development & Deployment Scripts
│   ├── setup.sh              # Complete system setup
│   ├── dev-start.sh          # Development environment
│   └── deploy/               # Production deployment scripts
└── tests/                     # Comprehensive Test Suite
    ├── unit/                  # Unit tests
    ├── integration/           # Integration tests
    ├── e2e/                   # End-to-end tests
    └── load/                  # Performance tests
```

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Python 3.11+
- Kubernetes (for production)

### Development Setup

1. **Clone and setup**:
   ```bash
   git clone <repository>
   cd hypatiaOS
   npm run setup
   ```

2. **Start development environment**:
   ```bash
   docker-compose up -d
   npm run dev
   ```

3. **Access the application**:
   - Web App: http://localhost:3000
   - API Gateway: http://localhost:8080
   - Documentation: http://localhost:3000/docs

## 👥 User Roles & Permissions

| Role | Description | Core Tools Access |
|------|-------------|-------------------|
| **Sponsor** | Funds and oversees trials | Budget approval, forecasting dashboards, global analytics |
| **CRO (Contract Research Organization)** | Manages contracts, budgets, and site payments | Contract editor, site payment tracker, compliance logs |
| **Site** | Conducts trials, logs procedures, receives payments | EDC-linked invoicing, payment visibility, reporting |
| **Finance/Admin** | Manages financial workflows and reconciliations | FX tools, tax setup, global payment monitoring |
| **System (HypatiaOS)** | Automation and intelligence layer | API orchestration, triggers, analytics, audit logging |

## ⚙️ Workflow: Contract → Payment Lifecycle

### **Step 1: Study Setup**
- Sponsor defines study and invites CRO/Site users
- Study metadata stored in `study-service`

### **Step 2: Budget Creation**  
- CRO drafts budget with AI suggestions (industry benchmarks, rate cards)
- `budget-service` manages versioning and validation

### **Step 3: Contract Negotiation**
- AI-assisted `contract-service` builds contract templates
- `negotiation-service` tracks all change requests and risk scoring

### **Step 4: Contract Finalization**
- Sponsor approves contract; FOE links it to payment terms

### **Step 5: Study Execution**
- Site conducts visits; data is captured via EDC integration
- `integration-hub-service` triggers payment events in FOE

### **Step 6: Payment Processing**
- `payment-service` calculates due payments (per visit/procedure)
- `fx-service` converts to local currency
- `payment-gateway-service` executes payment

### **Step 7: Reconciliation & Reporting**
- `audit-service` logs all transactions immutably
- `analytics-service` updates dashboards and forecasts

## 🧮 Data Flow Example

**Trigger**: Site completes Visit #3 in EDC
→ `integration-hub` sends data to `payment-service`
→ `payment-service` checks contract → identifies $300 owed
→ `fx-service` converts USD→EUR at live rate
→ `payment-gateway-service` executes payment
→ `audit-service` logs transaction hash (optionally via blockchain)
→ `analytics-service` updates CRO & Sponsor dashboards in real time

## 🧩 Core Platform Modules

| Module | Purpose | Key Microservices | Status |
|--------|---------|-------------------|---------|
| **Financial Orchestration Engine (FOE)** | Automates the full financial lifecycle from negotiation to disbursement | contract-service, budget-service, payment-service, compliance-service, audit-service | 🟡 **In Development** |
| **AI Forecasting & Analytics** | Predictive modeling for cost, performance, and delays | forecasting-service, analytics-service, simulation-service | 🟡 **In Development** |
| **Contract & Budget Automation** | Dynamic template generation, negotiation tools, version control | template-service, negotiation-service, version-service | 🟡 **In Development** |
| **Payment Execution Layer** | Localized multi-currency payment processing | payment-gateway-service, fx-service, banking-integration-service | 🔴 **Planned** |
| **Integration Layer** | Connects with external EDC, CTMS, ERP, eTMF systems | integration-hub-service, api-gateway, message-bus | 🟡 **In Development** |
| **Compliance & Audit** | Maintains regulatory and financial traceability | audit-service, compliance-service, blockchain-service | 🟡 **In Development** |

## 🏗️ Current Implementation Status

### ✅ **What We've Built (Current)**
- **Authentication & RBAC System**: Complete user management with 19 role-based user types
- **Frontend Application**: React-based web app with role-specific dashboards
- **Database Schema**: Comprehensive financial data model (50+ tables)
- **Core Service Architecture**: Basic microservices structure for auth, contracts, budgets
- **Development Infrastructure**: Docker configurations, development setup scripts
- **Documentation**: Comprehensive technical and business documentation

### 🟡 **In Active Development**
- **Contract Service**: Basic contract CRUD operations and data models
- **Budget Service**: Budget creation and management workflows  
- **Payment Service**: Foundation for payment processing (no live payments yet)
- **AI Engine**: Framework for risk assessment and forecasting (no ML models yet)
- **Integration Layer**: API structure for external system connections

### 🔴 **Planned Features (Roadmap)**
- **Live Multi-Currency Processing**: Real FX rates, actual payment execution
- **AI Risk Assessment**: ML models for contract analysis and risk scoring
- **EDC Integration**: Live data triggers for automated payments
- **Global Tax Compliance**: VAT/GST calculations for all jurisdictions
- **Banking Integrations**: SWIFT, ACH, SEPA payment rails
- **Advanced Analytics**: Predictive modeling and Monte Carlo simulations
- **Mobile Applications**: Native apps for payment tracking and approvals
- **Blockchain Audit**: Immutable transaction records

## 🧭 Development Roadmap

| Phase | Focus | Deliverables | Timeline |
|-------|-------|--------------|----------|
| **Phase 1 (M1–M3)** | Core FOE, Contracts, Budgets | contract-service, budget-service, API Gateway | Current |
| **Phase 2 (M4–M6)** | Payments & Integrations | EDC sync, payment automation, CTMS link | Next |
| **Phase 3 (M7–M9)** | AI Forecasting | forecasting-service, simulation dashboards | Future |
| **Phase 4 (M10–M12)** | Global Payments + Compliance | FX automation, blockchain audit, mobile app | Future |

## Compliance & Security

### Regulatory Compliance
- **21 CFR Part 11**: Electronic records & signatures
- **ICH GCP**: Good Clinical Practice
- **GDPR/HIPAA**: Data privacy & protection
- **Audit Trails**: Immutable change logs
- **Validation**: V-model approach with IQ/OQ/PQ

### Security Controls
- Encryption at rest (AES-256) and in transit (TLS 1.2+)
- Key management via KMS
- Role-based access control (RBAC)
- Multi-factor authentication (MFA)
- Regular security assessments

## 🧾 Integrations

| External System | Purpose | Integration Type |
|----------------|---------|------------------|
| **EDC** | Visit/procedure data | Webhooks / REST APIs |
| **CTMS** | Study management data | Bi-directional sync |
| **ERP / Accounting** | Financial reporting | API / CSV import |
| **eTMF** | Document archiving | SFTP / Cloud connector |
| **FX API (e.g. OpenExchangeRates)** | Currency conversion | REST API |
| **Payment Gateways (Stripe, Wise, SWIFT)** | Global disbursements | Secure API integration |

## 📈 Example API Endpoints

### Create Contract
```bash
POST /contracts/create
{
  "study_id": "STUDY_001",
  "site_id": "SITE_047", 
  "currency": "USD",
  "budget_id": "BUDGET_103",
  "terms": { "visit_fee": 300, "max_visits": 10 }
}
```

### Trigger Payment
```bash
POST /payments/trigger
{
  "event": "VISIT_COMPLETED",
  "site_id": "SITE_047",
  "amount": 300,
  "currency": "USD", 
  "trigger_source": "EDC"
}
```

## Development

### 🧑‍💻 Contributing Guidelines
- All services must expose REST + GraphQL endpoints
- Use internal message bus for inter-service events
- Follow shared schema for contracts, budgets, payments
- Every PR must include API doc updates and integration tests
- Commit naming convention: `feat|fix|chore(scope): message`

### API Standards
- REST APIs with OpenAPI 3.0 specifications
- gRPC for internal service communication
- Event-driven architecture with Kafka
- HATEOAS for workflow-driven UIs

### Code Standards
- TypeScript for frontend services
- Python for AI/ML services
- Go for high-performance services
- Comprehensive test coverage (>90%)
- Automated CI/CD pipelines

## Documentation

- [API Documentation](./docs/api/)
- [Database Schema](./docs/database/)
- [Deployment Guide](./docs/deployment/)
- [User Guides](./docs/users/)
- [Compliance Documentation](./docs/compliance/)

## License

Proprietary - All rights reserved

## ✅ Summary

hypatiaOS unifies every stakeholder in clinical research under one intelligent financial infrastructure. Our north star is simple: **"Zero manual steps between contract and payment."**

### Current Status
- ✅ **Foundation Built**: Core architecture, authentication, database schema, and frontend
- 🟡 **Active Development**: Financial services, contract management, and basic workflows  
- 🔴 **Next Phase**: Live payments, AI models, and external integrations

### Repository
- **GitHub**: https://github.com/EliasDjemaa/hypatiaOS
- **Documentation**: Comprehensive technical and business docs included
- **Setup**: Follow `SETUP_INSTRUCTIONS.md` for local development

## Support

For technical support or questions, please contact the development team.
