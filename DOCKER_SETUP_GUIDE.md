# Docker Setup Guide for hypatiaOS
## Complete System Testing with Docker

## 🚨 Docker Storage Issue Resolution

If you're experiencing Docker storage corruption issues (like we just encountered), here's how to fix it:

### **Step 1: Complete Docker Reset**

1. **Quit Docker Desktop completely**:
   ```bash
   # Quit Docker Desktop from the menu bar or:
   killall Docker
   ```

2. **Reset Docker Desktop to factory defaults**:
   - Open Docker Desktop
   - Go to Settings → Troubleshoot → Reset to factory defaults
   - Click "Reset to factory defaults"
   - Wait for the reset to complete

3. **Alternative manual reset** (if GUI doesn't work):
   ```bash
   # Remove Docker data (requires admin privileges)
   sudo rm -rf ~/Library/Containers/com.docker.docker/Data
   
   # Restart Docker Desktop
   open -a Docker
   ```

### **Step 2: Verify Docker is Working**

```bash
# Check Docker version
docker version

# Test with a simple container
docker run hello-world

# Clean up
docker system prune -f
```

---

## 🐳 Complete hypatiaOS Docker Deployment

Once Docker is working, use this complete setup:

### **Step 1: Start Infrastructure Services**

```bash
# Navigate to hypatiaOS directory
cd /Users/elias/CascadeProjects/hypatiaOS

# Start core infrastructure
docker-compose -f docker-compose.minimal.yml up -d
```

### **Step 2: Verify Services are Running**

```bash
# Check all containers are running
docker ps

# Expected output:
# CONTAINER ID   IMAGE              COMMAND                  CREATED         STATUS         PORTS                    NAMES
# abc123...      postgres:15        "docker-entrypoint.s…"   2 minutes ago   Up 2 minutes   0.0.0.0:5432->5432/tcp   hypatia-postgres
# def456...      redis:7-alpine     "docker-entrypoint.s…"   2 minutes ago   Up 2 minutes   0.0.0.0:6379->6379/tcp   hypatia-redis
# ghi789...      redis:7-alpine     "docker-entrypoint.s…"   2 minutes ago   Up 2 minutes   0.0.0.0:6380->6379/tcp   hypatia-events
```

### **Step 3: Test Database Connection**

```bash
# Connect to PostgreSQL
docker exec -it hypatia-postgres psql -U postgres -d hypatia_os

# You should see the psql prompt:
# hypatia_os=#

# Test the database
\dt  # List tables
SELECT COUNT(*) FROM users;  # Should return demo users
\q   # Quit
```

### **Step 4: Test Redis Connection**

```bash
# Connect to Redis
docker exec -it hypatia-redis redis-cli

# Test Redis
ping  # Should return PONG
keys *  # List all keys
exit
```

---

## 🚀 Start Complete hypatiaOS System

### **Step 1: Start All Services**

```bash
# Start the complete system
npm run docker:up

# This will start:
# ✅ PostgreSQL (Financial & Clinical Data)
# ✅ Redis (Caching & Sessions) 
# ✅ Redis Streams (Event Processing)
# ✅ Web Application (React Frontend)
# ✅ All Microservices (12+ services)
```

### **Step 2: Access the Complete System**

1. **Web Application**: http://localhost:3000
2. **Database**: localhost:5432 (postgres/postgres123)
3. **Redis Cache**: localhost:6379
4. **Event Streams**: localhost:6380

### **Step 3: Test Complete Financial Workflows**

#### **Login Credentials:**
```typescript
// Test different financial roles
const testUsers = [
  // Sponsor Finance
  { email: 'sponsor.finance@demo.com', password: 'demo123', role: 'sponsor_finance_manager' },
  
  // CRO Finance  
  { email: 'cro.finance@demo.com', password: 'demo123', role: 'cro_finance_analyst' },
  
  // Site Finance
  { email: 'site.finance@demo.com', password: 'demo123', role: 'site_finance_coordinator' },
  
  // System Admin
  { email: 'admin@hypatia-os.com', password: 'demo123', role: 'system_admin' }
];
```

#### **Test Scenarios:**

1. **Contract Creation & AI Risk Assessment**
   - Login as `sponsor.finance@demo.com`
   - Navigate to Contracts → Create New Contract
   - Fill in study details and see AI risk analysis
   - Test contract negotiation workflow

2. **Budget Management & Forecasting**
   - Login as `cro.finance@demo.com` 
   - Navigate to Budgets → Create Budget
   - Add line items and milestone triggers
   - View AI-powered cost forecasting

3. **Payment Processing & Tracking**
   - Login as `site.finance@demo.com`
   - Navigate to Payments → View Payment Status
   - Submit expense reimbursements
   - Track milestone-based payments

4. **Real-Time Analytics**
   - Login as `admin@hypatia-os.com`
   - View Portfolio Analytics Dashboard
   - See real-time financial metrics
   - Test drill-down capabilities

---

## 🔧 Advanced Docker Configuration

### **Production-Ready Setup**

For production deployment, use the full Docker Compose configuration:

```bash
# Start complete production stack
docker-compose -f docker-compose.yml up -d

# This includes:
# - PostgreSQL cluster with replication
# - Redis cluster for high availability  
# - Kafka cluster for event streaming
# - MongoDB for document storage
# - MinIO for object storage
# - All 12+ microservices
# - Load balancer and API gateway
```

### **Monitoring & Observability**

```bash
# Start monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Includes:
# - Prometheus (metrics collection)
# - Grafana (dashboards)
# - Jaeger (distributed tracing)
# - ELK Stack (logging)
```

### **Service Health Checks**

```bash
# Check service health
docker-compose ps

# View service logs
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f contract-service

# Monitor resource usage
docker stats
```

---

## 🧪 Complete System Testing

### **Automated Test Suite**

```bash
# Run complete test suite
npm run test:docker

# This will test:
# ✅ Database connectivity and schema
# ✅ Redis caching and sessions
# ✅ Event streaming and processing
# ✅ All microservice endpoints
# ✅ Financial workflow integration
# ✅ AI engine functionality
# ✅ Multi-currency processing
# ✅ Real-time analytics
```

### **Load Testing**

```bash
# Run load tests
npm run test:load

# Tests:
# - 1000 concurrent users
# - Contract creation workflows
# - Payment processing
# - Real-time analytics
# - Database performance
```

### **Integration Testing**

```bash
# Test complete workflows
npm run test:integration

# Validates:
# - Contract-to-payment workflows
# - EDC-triggered payments
# - Multi-currency processing
# - AI risk assessment
# - Real-time event processing
```

---

## 📊 System Monitoring

### **Key Metrics to Monitor**

```bash
# Database performance
docker exec hypatia-postgres psql -U postgres -c "SELECT * FROM pg_stat_activity;"

# Redis performance  
docker exec hypatia-redis redis-cli info stats

# Container resource usage
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
```

### **Health Check Endpoints**

- **System Health**: http://localhost:3000/health
- **Database Health**: http://localhost:3000/health/database  
- **Redis Health**: http://localhost:3000/health/redis
- **Services Health**: http://localhost:3000/health/services

---

## 🎯 Expected Results

After successful Docker deployment, you should have:

✅ **Complete Financial Operations Platform**
- Contract lifecycle management with AI risk assessment
- Multi-currency global payment processing
- Real-time budget tracking and forecasting
- Automated invoice generation and approval

✅ **Clinical-Financial Integration**
- EDC events trigger automated payments
- CTMS milestones linked to budget releases
- Real-time data synchronization
- Complete audit trail

✅ **Enterprise-Grade Infrastructure**
- High availability with clustering
- Real-time monitoring and alerting
- Comprehensive security and compliance
- Scalable microservices architecture

✅ **AI-Powered Intelligence**
- Predictive cost modeling
- Contract risk assessment
- Real-time analytics and insights
- Automated anomaly detection

---

## 🚨 Troubleshooting

### **Common Issues**

1. **Port Conflicts**:
   ```bash
   # Check what's using ports
   lsof -i :5432  # PostgreSQL
   lsof -i :6379  # Redis
   lsof -i :3000  # Web app
   ```

2. **Memory Issues**:
   ```bash
   # Increase Docker memory allocation
   # Docker Desktop → Settings → Resources → Memory → 8GB+
   ```

3. **Storage Issues**:
   ```bash
   # Clean up Docker storage
   docker system prune -a --volumes -f
   ```

4. **Permission Issues**:
   ```bash
   # Fix file permissions
   sudo chown -R $(whoami) /Users/elias/CascadeProjects/hypatiaOS
   ```

### **Getting Help**

If you encounter issues:

1. Check Docker Desktop is running and healthy
2. Verify system requirements (8GB RAM, 20GB disk space)
3. Review container logs: `docker-compose logs [service-name]`
4. Test individual services: `docker-compose up [service-name]`
5. Reset to clean state: `docker-compose down -v && docker system prune -f`

---

## 🎉 Success Criteria

Your hypatiaOS Docker deployment is successful when:

✅ All containers are running and healthy
✅ Web application loads at http://localhost:3000
✅ Database contains demo data (users, studies, contracts)
✅ Financial workflows are functional
✅ Real-time analytics are updating
✅ Multi-user role-based access works
✅ AI features are responding
✅ Payment processing is operational

**Status**: 🟢 **Ready for Complete System Testing**
