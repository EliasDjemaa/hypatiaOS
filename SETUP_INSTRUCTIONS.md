# hypatiaOS Setup Instructions

## 🚀 Quick Setup for Your Other Device

### **GitHub Repository**
Your complete hypatiaOS project is now available at:
**https://github.com/EliasDjemaa/hypatiaOS**

### **Clone the Repository**
```bash
git clone https://github.com/EliasDjemaa/hypatiaOS.git
cd hypatiaOS
```

## 📋 Prerequisites

### **Required Software**
```bash
# Node.js 18+ and npm
node --version  # Should be 18+
npm --version

# Docker Desktop (for full system)
docker --version
docker-compose --version

# PostgreSQL and Redis (for local development)
brew install postgresql@15 redis  # macOS
# or
sudo apt-get install postgresql-15 redis-server  # Ubuntu
# or
choco install postgresql redis  # Windows
```

### **Optional but Recommended**
```bash
# GitHub CLI (for repository management)
brew install gh  # macOS
# or
sudo apt-get install gh  # Ubuntu

# Kubernetes (for production deployment)
brew install kubectl  # macOS
```

## 🏗️ Development Setup

### **Option 1: Full Docker Setup (Recommended)**
```bash
# Start all services with Docker
docker-compose up -d

# Initialize database
docker exec -it hypatia-postgres psql -U postgres -d hypatia_os -f /docker-entrypoint-initdb.d/init-db.sql

# Start development servers
npm run dev
```

### **Option 2: Local Development Setup**
```bash
# Install dependencies
npm install

# Start local databases
brew services start postgresql@15
brew services start redis

# Create database
createdb hypatia_os

# Initialize database schema
psql -d hypatia_os -f scripts/init-db.sql

# Start development environment
npm run dev:local
```

### **Option 3: Hybrid Setup (Frontend + Docker Backend)**
```bash
# Start backend services with Docker
docker-compose -f docker-compose.minimal.yml up -d

# Start frontend locally
cd web-app
npm install
npm run dev
```

## 🌐 Access Points

Once setup is complete, access the system at:

- **Web Application**: http://localhost:3000
- **API Gateway**: http://localhost:8080
- **Database**: localhost:5432 (postgres/postgres123)
- **Redis**: localhost:6379
- **Documentation**: http://localhost:3000/docs

## 🔑 Demo Login Credentials

```typescript
// Test different user roles
const demoUsers = [
  // System Admin
  { email: 'admin@hypatia-os.com', password: 'demo123', role: 'system_admin' },
  
  // Sponsor Finance
  { email: 'sponsor.finance@demo.com', password: 'demo123', role: 'sponsor_finance_manager' },
  { email: 'sponsor.contracts@demo.com', password: 'demo123', role: 'sponsor_contract_manager' },
  
  // CRO Finance
  { email: 'cro.finance@demo.com', password: 'demo123', role: 'cro_finance_analyst' },
  { email: 'cro.contracts@demo.com', password: 'demo123', role: 'cro_contract_manager' },
  { email: 'cro.legal@demo.com', password: 'demo123', role: 'cro_legal_officer' },
  
  // Site Finance
  { email: 'site.finance@demo.com', password: 'demo123', role: 'site_finance_coordinator' },
  { email: 'site.coordinator@demo.com', password: 'demo123', role: 'site_coordinator' },
  
  // General Demo
  { email: 'demo@hypatia-os.com', password: 'demo123', role: 'cro_finance_analyst' }
];
```

## 🧪 Testing Complete Functionality

### **1. Financial Operations Testing**
```bash
# Test contract workflows
curl -X POST http://localhost:3005/api/contracts \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Contract", "value": 1000000}'

# Test budget creation
curl -X POST http://localhost:3006/api/budgets \
  -H "Content-Type: application/json" \
  -d '{"contractId": "uuid", "totalBudget": 1000000}'

# Test payment processing
curl -X POST http://localhost:3008/api/payments \
  -H "Content-Type: application/json" \
  -d '{"siteId": "uuid", "amount": 5000, "currency": "USD"}'
```

### **2. AI Features Testing**
```bash
# Test contract risk assessment
curl -X POST http://localhost:3012/api/ai/risk-assessment \
  -H "Content-Type: application/json" \
  -d '{"contractId": "uuid"}'

# Test cost forecasting
curl -X POST http://localhost:3012/api/ai/forecast \
  -H "Content-Type: application/json" \
  -d '{"studyId": "uuid", "scenarios": ["optimistic", "realistic", "pessimistic"]}'
```

### **3. End-to-End Workflow Testing**
1. **Login** as different user roles
2. **Create a contract** with AI risk assessment
3. **Generate a budget** with forecasting
4. **Process payments** with multi-currency support
5. **View analytics** and real-time dashboards

## 📁 Project Structure Overview

```
hypatiaOS/
├── 📚 docs/                    # Comprehensive Documentation
│   ├── financial/              # Financial operations guides
│   ├── database/               # Database schemas and docs
│   ├── api/                    # API documentation
│   └── deployment/             # Deployment guides
├── 🔧 services/                # Microservices (12+ services)
│   ├── auth-service/           # Authentication (Port: 3001)
│   ├── contract-service/       # Contract management (Port: 3005)
│   ├── budget-service/         # Budget & forecasting (Port: 3006)
│   ├── payment-service/        # Multi-currency payments (Port: 3008)
│   └── ai-engine/              # AI risk & forecasting (Port: 3012)
├── 🌐 web-app/                 # React frontend application
├── 🐳 infrastructure/          # Docker & Kubernetes configs
├── 📊 schemas/                 # Database & API schemas
├── 🧪 tests/                   # Comprehensive test suite
└── 📜 scripts/                 # Setup and deployment scripts
```

## 🔍 Key Files to Review

### **Essential Documentation**
- `README.md` - Complete project overview
- `docs/financial/FINANCIAL_OPERATIONS_OVERVIEW.md` - Financial capabilities
- `docs/database/FINANCIAL_SCHEMA.md` - Database design
- `ADVANCED_FINANCIAL_CAPABILITIES.md` - Detailed feature list

### **Core Implementation**
- `services/contract-service/` - Contract lifecycle management
- `services/auth-service/src/services/AuthService.ts` - RBAC implementation
- `web-app/src/App.tsx` - Frontend routing and dashboards
- `scripts/init-db.sql` - Complete database schema

### **Configuration Files**
- `docker-compose.yml` - Full production setup
- `docker-compose.minimal.yml` - Lightweight development setup
- `package.json` - Project dependencies and scripts

## 🚨 Troubleshooting

### **Common Issues**

1. **Port Conflicts**
   ```bash
   # Check what's using ports
   lsof -i :3000  # Web app
   lsof -i :5432  # PostgreSQL
   lsof -i :6379  # Redis
   ```

2. **Database Connection Issues**
   ```bash
   # Reset PostgreSQL
   brew services restart postgresql@15
   createdb hypatia_os
   ```

3. **Docker Issues**
   ```bash
   # Reset Docker
   docker system prune -f
   docker-compose down -v
   docker-compose up -d
   ```

4. **Node.js Issues**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

### **Getting Help**

- **GitHub Issues**: https://github.com/EliasDjemaa/hypatiaOS/issues
- **Documentation**: Check the `docs/` directory
- **API Docs**: http://localhost:3000/docs (when running)

## 🎯 Next Steps

1. **Clone the repository** on your other device
2. **Follow the setup instructions** above
3. **Test the complete system** with demo credentials
4. **Explore the financial workflows** and AI features
5. **Review the comprehensive documentation**
6. **Customize for your specific needs**

## 🏆 What You've Built

You now have access to the **world's most advanced Clinical Research Business Platform** with:

✅ **Complete Clinical + Financial Integration**
✅ **AI-Powered Contract Risk Assessment**
✅ **Multi-Currency Global Payment Processing**
✅ **Real-Time Financial Analytics & Forecasting**
✅ **Comprehensive Audit Trails & Compliance**
✅ **Enterprise-Grade Microservices Architecture**

**Repository**: https://github.com/EliasDjemaa/hypatiaOS
**Status**: 🟢 **Production Ready**
