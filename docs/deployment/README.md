# hypatiaOS Deployment Guide

## Overview

This guide covers deploying hypatiaOS in various environments, from local development to production-ready cloud deployments. The platform is designed to be cloud-native and supports deployment on AWS, Azure, and GCP.

## Prerequisites

### System Requirements

**Minimum Requirements (Development):**
- 8 GB RAM
- 4 CPU cores
- 50 GB storage
- Docker & Docker Compose
- Node.js 18+
- Python 3.11+

**Production Requirements:**
- 32 GB RAM (per node)
- 8 CPU cores (per node)
- 500 GB SSD storage
- Kubernetes cluster
- Load balancer
- SSL certificates

### Software Dependencies

- **Container Runtime**: Docker 20.10+
- **Orchestration**: Kubernetes 1.25+
- **Databases**: PostgreSQL 15+, MongoDB 6.0+, Redis 7.0+
- **Message Queue**: Apache Kafka 3.0+
- **Object Storage**: S3-compatible storage
- **Monitoring**: Prometheus, Grafana (optional)

## Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/hypatia-os.git
cd hypatia-os
```

### 2. Environment Configuration

Create environment files:

```bash
# Copy example environment files
cp .env.example .env
cp services/auth-service/.env.example services/auth-service/.env
cp services/edc-engine/.env.example services/edc-engine/.env
# ... repeat for all services
```

### 3. Start Infrastructure Services

```bash
# Start databases and message queue
docker-compose up -d postgres mongodb redis kafka zookeeper minio

# Wait for services to be ready
./scripts/wait-for-services.sh
```

### 4. Install Dependencies

```bash
# Install root dependencies
npm install

# Install service dependencies
npm run setup:services
```

### 5. Database Setup

```bash
# Run database migrations
npm run migrate

# Seed development data (optional)
npm run seed:dev
```

### 6. Start Development Services

```bash
# Start all services in development mode
npm run dev

# Or start individual services
npm run dev:auth
npm run dev:edc
npm run dev:web
```

### 7. Verify Installation

- Web App: http://localhost:3000
- API Gateway: http://localhost:8080
- Auth Service: http://localhost:3001/health
- EDC Engine: http://localhost:3003/health

## Docker Deployment

### Single-Node Docker Compose

For small deployments or testing:

```bash
# Build all images
docker-compose build

# Start all services
docker-compose up -d

# Check service health
docker-compose ps
```

### Multi-Node Docker Swarm

For production-like deployments:

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.prod.yml hypatia

# Scale services
docker service scale hypatia_edc-engine=3
docker service scale hypatia_auth-service=2
```

## Kubernetes Deployment

### 1. Cluster Setup

**AWS EKS:**
```bash
# Create EKS cluster
eksctl create cluster \
  --name hypatia-prod \
  --version 1.25 \
  --region us-west-2 \
  --nodegroup-name standard-workers \
  --node-type m5.xlarge \
  --nodes 3 \
  --nodes-min 1 \
  --nodes-max 10 \
  --managed
```

**Azure AKS:**
```bash
# Create resource group
az group create --name hypatia-rg --location eastus

# Create AKS cluster
az aks create \
  --resource-group hypatia-rg \
  --name hypatia-prod \
  --node-count 3 \
  --node-vm-size Standard_D4s_v3 \
  --enable-addons monitoring \
  --generate-ssh-keys
```

**GCP GKE:**
```bash
# Create GKE cluster
gcloud container clusters create hypatia-prod \
  --zone us-central1-a \
  --num-nodes 3 \
  --machine-type n1-standard-4 \
  --enable-autoscaling \
  --min-nodes 1 \
  --max-nodes 10
```

### 2. Install Required Components

```bash
# Install NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Install cert-manager for SSL
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Install Prometheus & Grafana (optional)
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install monitoring prometheus-community/kube-prometheus-stack
```

### 3. Create Namespaces

```bash
kubectl create namespace hypatia-prod
kubectl create namespace hypatia-monitoring
```

### 4. Configure Secrets

```bash
# Database credentials
kubectl create secret generic db-credentials \
  --from-literal=postgres-password=your-secure-password \
  --from-literal=mongodb-password=your-secure-password \
  --namespace=hypatia-prod

# JWT secrets
kubectl create secret generic jwt-secret \
  --from-literal=jwt-secret=your-jwt-secret-key \
  --namespace=hypatia-prod

# SSL certificates
kubectl create secret tls hypatia-tls \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key \
  --namespace=hypatia-prod
```

### 5. Deploy Infrastructure

```bash
# Deploy PostgreSQL
kubectl apply -f infrastructure/kubernetes/postgres.yaml

# Deploy MongoDB
kubectl apply -f infrastructure/kubernetes/mongodb.yaml

# Deploy Redis
kubectl apply -f infrastructure/kubernetes/redis.yaml

# Deploy Kafka
kubectl apply -f infrastructure/kubernetes/kafka.yaml
```

### 6. Deploy Application Services

```bash
# Deploy all services
kubectl apply -f infrastructure/kubernetes/

# Or deploy individually
kubectl apply -f infrastructure/kubernetes/auth-service.yaml
kubectl apply -f infrastructure/kubernetes/edc-engine.yaml
kubectl apply -f infrastructure/kubernetes/web-app.yaml
```

### 7. Configure Ingress

```bash
# Apply ingress configuration
kubectl apply -f infrastructure/kubernetes/ingress.yaml
```

## Cloud-Specific Deployments

### AWS Deployment

#### Using AWS ECS Fargate

```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name hypatia-prod

# Register task definitions
aws ecs register-task-definition --cli-input-json file://infrastructure/aws/auth-service-task.json

# Create services
aws ecs create-service \
  --cluster hypatia-prod \
  --service-name auth-service \
  --task-definition auth-service:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
```

#### Using AWS RDS and ElastiCache

```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier hypatia-postgres \
  --db-instance-class db.r5.xlarge \
  --engine postgres \
  --engine-version 15.3 \
  --allocated-storage 100 \
  --storage-type gp2 \
  --db-name hypatia_os \
  --master-username hypatia \
  --master-user-password your-secure-password

# Create ElastiCache Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id hypatia-redis \
  --cache-node-type cache.r5.large \
  --engine redis \
  --num-cache-nodes 1
```

### Azure Deployment

#### Using Azure Container Instances

```bash
# Create resource group
az group create --name hypatia-rg --location eastus

# Deploy container group
az container create \
  --resource-group hypatia-rg \
  --name hypatia-auth \
  --image your-registry/hypatia-auth:latest \
  --cpu 2 \
  --memory 4 \
  --ports 3000 \
  --environment-variables NODE_ENV=production
```

#### Using Azure Database Services

```bash
# Create PostgreSQL server
az postgres server create \
  --resource-group hypatia-rg \
  --name hypatia-postgres \
  --location eastus \
  --admin-user hypatia \
  --admin-password your-secure-password \
  --sku-name GP_Gen5_4 \
  --version 15

# Create Redis cache
az redis create \
  --resource-group hypatia-rg \
  --name hypatia-redis \
  --location eastus \
  --sku Standard \
  --vm-size c1
```

### GCP Deployment

#### Using Cloud Run

```bash
# Deploy auth service
gcloud run deploy auth-service \
  --image gcr.io/your-project/hypatia-auth:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --max-instances 10
```

#### Using Cloud SQL and Memorystore

```bash
# Create Cloud SQL PostgreSQL instance
gcloud sql instances create hypatia-postgres \
  --database-version POSTGRES_15 \
  --tier db-standard-4 \
  --region us-central1

# Create Memorystore Redis instance
gcloud redis instances create hypatia-redis \
  --size 5 \
  --region us-central1 \
  --redis-version redis_7_0
```

## Configuration Management

### Environment Variables

**Core Configuration:**
```bash
# Application
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
MONGODB_URL=mongodb://user:pass@host:27017/db
REDIS_URL=redis://host:6379

# Security
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key

# External Services
S3_BUCKET=hypatia-documents
S3_REGION=us-west-2
KAFKA_BROKERS=broker1:9092,broker2:9092

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
PROMETHEUS_ENDPOINT=http://prometheus:9090
```

### ConfigMaps (Kubernetes)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: hypatia-config
  namespace: hypatia-prod
data:
  NODE_ENV: "production"
  LOG_LEVEL: "info"
  KAFKA_BROKERS: "kafka-service:9092"
  S3_REGION: "us-west-2"
```

## SSL/TLS Configuration

### Let's Encrypt with cert-manager

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@your-domain.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
```

### Custom SSL Certificates

```bash
# Create certificate secret
kubectl create secret tls hypatia-tls \
  --cert=certificate.crt \
  --key=private.key \
  --namespace=hypatia-prod
```

## Monitoring and Logging

### Prometheus Configuration

```yaml
# prometheus-config.yaml
global:
  scrape_interval: 15s
scrape_configs:
  - job_name: 'hypatia-services'
    static_configs:
      - targets: ['auth-service:3001', 'edc-engine:3003']
    metrics_path: /metrics
```

### Grafana Dashboards

```bash
# Import pre-built dashboards
kubectl apply -f infrastructure/monitoring/grafana-dashboards.yaml
```

### Centralized Logging

**Using ELK Stack:**
```bash
# Deploy Elasticsearch
kubectl apply -f infrastructure/logging/elasticsearch.yaml

# Deploy Logstash
kubectl apply -f infrastructure/logging/logstash.yaml

# Deploy Kibana
kubectl apply -f infrastructure/logging/kibana.yaml
```

**Using Fluentd:**
```bash
# Deploy Fluentd DaemonSet
kubectl apply -f infrastructure/logging/fluentd.yaml
```

## Backup and Disaster Recovery

### Database Backups

**PostgreSQL:**
```bash
# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h $DB_HOST -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Retention policy (keep 30 days)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

**MongoDB:**
```bash
# MongoDB backup
mongodump --host $MONGO_HOST --db $MONGO_DB --out /backups/mongodb/$(date +%Y%m%d_%H%M%S)
```

### Application Data Backup

```bash
# Backup S3 documents
aws s3 sync s3://hypatia-documents s3://hypatia-backups/documents/$(date +%Y%m%d)

# Backup configuration
kubectl get configmaps -o yaml > backups/configmaps-$(date +%Y%m%d).yaml
kubectl get secrets -o yaml > backups/secrets-$(date +%Y%m%d).yaml
```

## Security Hardening

### Network Security

```yaml
# Network policies
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: hypatia-network-policy
spec:
  podSelector:
    matchLabels:
      app: hypatia
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: hypatia
    ports:
    - protocol: TCP
      port: 3000
```

### Pod Security Standards

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: auth-service
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1001
    fsGroup: 1001
  containers:
  - name: auth-service
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL
```

## Performance Optimization

### Resource Limits

```yaml
resources:
  requests:
    memory: "512Mi"
    cpu: "250m"
  limits:
    memory: "2Gi"
    cpu: "1000m"
```

### Horizontal Pod Autoscaling

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: auth-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: auth-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## Troubleshooting

### Common Issues

**Service Discovery:**
```bash
# Check service endpoints
kubectl get endpoints -n hypatia-prod

# Test service connectivity
kubectl run test-pod --image=busybox -it --rm -- nslookup auth-service
```

**Database Connectivity:**
```bash
# Test PostgreSQL connection
kubectl run postgres-test --image=postgres:15 -it --rm -- psql -h postgres-service -U hypatia -d hypatia_os
```

**Resource Issues:**
```bash
# Check resource usage
kubectl top nodes
kubectl top pods -n hypatia-prod

# Check events
kubectl get events -n hypatia-prod --sort-by='.lastTimestamp'
```

### Log Analysis

```bash
# View service logs
kubectl logs -f deployment/auth-service -n hypatia-prod

# View logs from all pods
kubectl logs -f -l app=hypatia -n hypatia-prod --all-containers=true
```

## Maintenance

### Rolling Updates

```bash
# Update service image
kubectl set image deployment/auth-service auth-service=your-registry/hypatia-auth:v2.0.0 -n hypatia-prod

# Check rollout status
kubectl rollout status deployment/auth-service -n hypatia-prod

# Rollback if needed
kubectl rollout undo deployment/auth-service -n hypatia-prod
```

### Database Migrations

```bash
# Run migrations
kubectl create job migration-$(date +%s) --from=cronjob/db-migration -n hypatia-prod

# Check migration status
kubectl logs job/migration-1234567890 -n hypatia-prod
```

## Compliance and Validation

### 21 CFR Part 11 Compliance

- All deployments must use encrypted storage
- Audit logs must be immutable and retained for 25+ years
- Electronic signatures must be cryptographically secure
- System validation documentation must be maintained

### Validation Checklist

- [ ] Infrastructure Qualification (IQ) completed
- [ ] Operational Qualification (OQ) completed
- [ ] Performance Qualification (PQ) completed
- [ ] Security assessment completed
- [ ] Backup and recovery tested
- [ ] Disaster recovery plan validated
- [ ] User acceptance testing completed
- [ ] Regulatory documentation complete

## Support and Maintenance

### Health Checks

```bash
# Service health endpoints
curl http://auth-service:3001/health
curl http://edc-engine:3003/health
curl http://etmf-service:3004/health
```

### Monitoring Alerts

Configure alerts for:
- Service availability < 99.9%
- Response time > 2 seconds
- Error rate > 1%
- Database connection failures
- Disk usage > 80%
- Memory usage > 85%

### Maintenance Windows

- **Weekly**: Security updates, minor patches
- **Monthly**: Feature updates, dependency updates
- **Quarterly**: Major version updates, infrastructure updates
- **Annually**: Full system validation, disaster recovery testing
