#!/bin/bash

# hypatiaOS Setup Script
# This script sets up the development environment for hypatiaOS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check system requirements
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Node.js
    if command_exists node; then
        NODE_VERSION=$(node --version | cut -d'v' -f2)
        REQUIRED_NODE="18.0.0"
        if [ "$(printf '%s\n' "$REQUIRED_NODE" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_NODE" ]; then
            print_success "Node.js $NODE_VERSION found"
        else
            print_error "Node.js $REQUIRED_NODE or higher required. Found: $NODE_VERSION"
            exit 1
        fi
    else
        print_error "Node.js not found. Please install Node.js 18 or higher"
        exit 1
    fi
    
    # Check npm
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        print_success "npm $NPM_VERSION found"
    else
        print_error "npm not found"
        exit 1
    fi
    
    # Check Docker
    if command_exists docker; then
        DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
        print_success "Docker $DOCKER_VERSION found"
    else
        print_error "Docker not found. Please install Docker"
        exit 1
    fi
    
    # Check Docker Compose
    if command_exists docker-compose || docker compose version >/dev/null 2>&1; then
        print_success "Docker Compose found"
    else
        print_error "Docker Compose not found. Please install Docker Compose"
        exit 1
    fi
    
    # Check Python (for AI services)
    if command_exists python3; then
        PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
        print_success "Python $PYTHON_VERSION found"
    else
        print_warning "Python3 not found. AI services may not work properly"
    fi
    
    print_success "All requirements satisfied"
}

# Function to create environment files
create_env_files() {
    print_status "Creating environment files..."
    
    # Root .env file
    if [ ! -f .env ]; then
        cat > .env << EOF
# hypatiaOS Environment Configuration
NODE_ENV=development
LOG_LEVEL=debug

# Database URLs
DATABASE_URL=postgresql://hypatia:dev_password@localhost:5432/hypatia_os
MONGODB_URL=mongodb://hypatia:dev_password@localhost:27017/hypatia_os
REDIS_URL=redis://localhost:6379

# Message Queue
KAFKA_BROKERS=localhost:9092

# Object Storage
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=hypatia
S3_SECRET_KEY=dev_password
S3_BUCKET=hypatia-documents

# Security
JWT_SECRET=dev_jwt_secret_change_in_production_please_use_32_chars_minimum
ENCRYPTION_KEY=dev_encryption_key_change_in_production

# External APIs
FHIR_SERVER_URL=http://localhost:8080/fhir
HL7_ENDPOINT=localhost:2575

# Monitoring
SENTRY_DSN=
PROMETHEUS_ENDPOINT=http://localhost:9090

# Email (optional for development)
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASSWORD=
EOF
        print_success "Created root .env file"
    else
        print_warning ".env file already exists, skipping"
    fi
    
    # Service-specific env files
    services=("auth-service" "study-management" "edc-engine" "etmf-service" "ai-engine")
    
    for service in "${services[@]}"; do
        service_env="services/$service/.env"
        if [ ! -f "$service_env" ]; then
            cp .env "$service_env"
            print_success "Created $service_env"
        else
            print_warning "$service_env already exists, skipping"
        fi
    done
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    print_status "Installing root dependencies..."
    npm install
    
    # Install service dependencies
    print_status "Installing service dependencies..."
    for service_dir in services/*/; do
        if [ -f "$service_dir/package.json" ]; then
            service_name=$(basename "$service_dir")
            print_status "Installing dependencies for $service_name..."
            (cd "$service_dir" && npm install)
        fi
    done
    
    # Install web app dependencies
    if [ -f "web-app/package.json" ]; then
        print_status "Installing web app dependencies..."
        (cd web-app && npm install)
    fi
    
    print_success "All dependencies installed"
}

# Function to start infrastructure services
start_infrastructure() {
    print_status "Starting infrastructure services..."
    
    # Start databases and supporting services
    docker-compose up -d postgres mongodb redis kafka zookeeper minio
    
    print_status "Waiting for services to be ready..."
    
    # Wait for PostgreSQL
    print_status "Waiting for PostgreSQL..."
    until docker-compose exec -T postgres pg_isready -U hypatia >/dev/null 2>&1; do
        sleep 2
    done
    print_success "PostgreSQL is ready"
    
    # Wait for MongoDB
    print_status "Waiting for MongoDB..."
    until docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" >/dev/null 2>&1; do
        sleep 2
    done
    print_success "MongoDB is ready"
    
    # Wait for Redis
    print_status "Waiting for Redis..."
    until docker-compose exec -T redis redis-cli ping >/dev/null 2>&1; do
        sleep 2
    done
    print_success "Redis is ready"
    
    # Wait for Kafka
    print_status "Waiting for Kafka..."
    sleep 10  # Kafka takes longer to start
    print_success "Kafka should be ready"
    
    # Wait for MinIO
    print_status "Waiting for MinIO..."
    until curl -f http://localhost:9000/minio/health/live >/dev/null 2>&1; do
        sleep 2
    done
    print_success "MinIO is ready"
    
    print_success "All infrastructure services are running"
}

# Function to setup databases
setup_databases() {
    print_status "Setting up databases..."
    
    # Create S3 buckets
    print_status "Creating S3 buckets..."
    docker-compose exec -T minio mc alias set local http://localhost:9000 hypatia dev_password
    docker-compose exec -T minio mc mb local/hypatia-documents --ignore-existing
    docker-compose exec -T minio mc mb local/hypatia-backups --ignore-existing
    
    print_success "Database setup completed"
}

# Function to build services
build_services() {
    print_status "Building services..."
    
    # Build Docker images
    docker-compose build
    
    print_success "Services built successfully"
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    
    # Run unit tests for services
    for service_dir in services/*/; do
        if [ -f "$service_dir/package.json" ]; then
            service_name=$(basename "$service_dir")
            if grep -q '"test"' "$service_dir/package.json"; then
                print_status "Running tests for $service_name..."
                (cd "$service_dir" && npm test) || print_warning "Tests failed for $service_name"
            fi
        fi
    done
    
    # Run web app tests
    if [ -f "web-app/package.json" ] && grep -q '"test"' "web-app/package.json"; then
        print_status "Running web app tests..."
        (cd web-app && npm test) || print_warning "Web app tests failed"
    fi
    
    print_success "Tests completed"
}

# Function to display final instructions
show_final_instructions() {
    echo
    print_success "🎉 hypatiaOS setup completed successfully!"
    echo
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Start the development servers:"
    echo -e "   ${GREEN}npm run dev${NC}"
    echo
    echo "2. Access the application:"
    echo -e "   • Web App: ${GREEN}http://localhost:3000${NC}"
    echo -e "   • API Gateway: ${GREEN}http://localhost:8080${NC}"
    echo -e "   • Auth Service: ${GREEN}http://localhost:3001${NC}"
    echo -e "   • MinIO Console: ${GREEN}http://localhost:9001${NC} (hypatia/dev_password)"
    echo
    echo "3. Default login credentials:"
    echo -e "   • Email: ${GREEN}admin@hypatia-os.com${NC}"
    echo -e "   • Password: ${GREEN}admin123${NC}"
    echo
    echo "4. Useful commands:"
    echo -e "   • View logs: ${GREEN}docker-compose logs -f [service]${NC}"
    echo -e "   • Stop services: ${GREEN}docker-compose down${NC}"
    echo -e "   • Reset data: ${GREEN}docker-compose down -v${NC}"
    echo
    echo -e "${YELLOW}Note:${NC} This is a development setup. For production deployment,"
    echo "please refer to the deployment documentation in docs/deployment/"
    echo
}

# Main setup function
main() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                     hypatiaOS Setup                         ║"
    echo "║              Clinical Trial Operating System                ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    # Parse command line arguments
    SKIP_TESTS=false
    SKIP_BUILD=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --skip-tests    Skip running tests"
                echo "  --skip-build    Skip building Docker images"
                echo "  --help          Show this help message"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Run setup steps
    check_requirements
    create_env_files
    install_dependencies
    start_infrastructure
    setup_databases
    
    if [ "$SKIP_BUILD" = false ]; then
        build_services
    fi
    
    if [ "$SKIP_TESTS" = false ]; then
        run_tests
    fi
    
    show_final_instructions
}

# Run main function
main "$@"
