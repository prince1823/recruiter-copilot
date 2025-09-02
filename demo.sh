#!/bin/bash

# Recruiter Copilot Dashboard - Demo Script
# This script demonstrates the application features

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}  Recruiter Copilot Dashboard  ${NC}"
    echo -e "${PURPLE}        Demo Script            ${NC}"
    echo -e "${PURPLE}================================${NC}"
    echo ""
}

print_feature() {
    echo -e "${CYAN}[FEATURE]${NC} $1"
}

print_demo() {
    echo -e "${BLUE}[DEMO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_info() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

# Check if application is running
check_application() {
    print_demo "Checking if application is running..."
    
    if curl -s http://localhost > /dev/null; then
        print_success "Frontend is accessible at http://localhost"
    else
        print_info "Frontend not accessible. Please start the application first:"
        echo "  ./deploy.sh"
        exit 1
    fi
    
    if curl -s http://localhost:3000/health > /dev/null; then
        print_success "Backend is accessible at http://localhost:3000"
    else
        print_info "Backend not accessible. Please start the application first:"
        echo "  ./deploy.sh"
        exit 1
    fi
}

# Demo API endpoints
demo_api() {
    print_feature "API Endpoints Demo"
    echo ""
    
    print_demo "1. Health Check"
    echo "   curl http://localhost:3000/health"
    curl -s http://localhost:3000/health | jq . 2>/dev/null || curl -s http://localhost:3000/health
    echo ""
    
    print_demo "2. Get All Data"
    echo "   curl http://localhost/api/data"
    curl -s http://localhost/api/data | jq . 2>/dev/null || curl -s http://localhost/api/data
    echo ""
    
    print_demo "3. Get Applicants"
    echo "   curl http://localhost/api/applicants"
    curl -s http://localhost/api/applicants | jq . 2>/dev/null || curl -s http://localhost/api/applicants
    echo ""
    
    print_demo "4. Get Lists"
    echo "   curl http://localhost/api/lists"
    curl -s http://localhost/api/lists | jq . 2>/dev/null || curl -s http://localhost/api/lists
    echo ""
}

# Demo Docker commands
demo_docker() {
    print_feature "Docker Management Demo"
    echo ""
    
    print_demo "1. Check Container Status"
    echo "   docker compose ps"
    docker compose ps
    echo ""
    
    print_demo "2. View Container Logs"
    echo "   docker compose logs --tail=5"
    docker compose logs --tail=5
    echo ""
    
    print_demo "3. Check Resource Usage"
    echo "   docker stats --no-stream"
    docker stats --no-stream 2>/dev/null || echo "   (docker stats not available)"
    echo ""
}

# Demo application features
demo_features() {
    print_feature "Application Features"
    echo ""
    
    echo -e "${YELLOW}🎯 Frontend Features:${NC}"
    echo "  • Table View: Comprehensive applicant management"
    echo "  • Chat View: Real-time candidate communication"
    echo "  • List Management: Create and manage candidate lists"
    echo "  • Bulk Actions: Perform operations on multiple candidates"
    echo "  • CSV Export: Download applicant data"
    echo "  • Real-time Updates: Live data synchronization"
    echo ""
    
    echo -e "${YELLOW}🔧 Backend Features:${NC}"
    echo "  • RESTful API: Complete API for all operations"
    echo "  • Data Persistence: JSON-based storage"
    echo "  • Health Monitoring: Built-in health checks"
    echo "  • Message Queue: Automated processing"
    echo "  • CORS Support: Cross-origin resource sharing"
    echo ""
    
    echo -e "${YELLOW}🐳 Docker Features:${NC}"
    echo "  • Containerized: Fully containerized deployment"
    echo "  • Health Checks: Automatic monitoring and restart"
    echo "  • Persistent Storage: Data persists across restarts"
    echo "  • Network Isolation: Secure internal communication"
    echo "  • Production Ready: Optimized for production"
    echo ""
}

# Demo URLs and access
demo_access() {
    print_feature "Application Access"
    echo ""
    
    echo -e "${GREEN}🌐 Access URLs:${NC}"
    echo "  • Main Application: http://localhost"
    echo "  • Backend API: http://localhost:3000"
    echo "  • Health Check: http://localhost:3000/health"
    echo "  • API Data: http://localhost/api/data"
    echo ""
    
    echo -e "${GREEN}📱 Open in Browser:${NC}"
    if command -v open &> /dev/null; then
        echo "  Opening http://localhost in your default browser..."
        open http://localhost
    elif command -v xdg-open &> /dev/null; then
        echo "  Opening http://localhost in your default browser..."
        xdg-open http://localhost
    else
        echo "  Please open http://localhost in your web browser"
    fi
    echo ""
}

# Demo management commands
demo_commands() {
    print_feature "Management Commands"
    echo ""
    
    echo -e "${CYAN}🚀 Start/Stop:${NC}"
    echo "  • Start: docker compose up -d"
    echo "  • Stop: docker compose down"
    echo "  • Restart: docker compose restart"
    echo ""
    
    echo -e "${CYAN}📊 Monitoring:${NC}"
    echo "  • View logs: docker compose logs -f"
    echo "  • Check status: docker compose ps"
    echo "  • Test deployment: ./test-docker.sh"
    echo ""
    
    echo -e "${CYAN}🔧 Development:${NC}"
    echo "  • Rebuild: docker compose up --build -d"
    echo "  • Clean rebuild: docker compose down --rmi all --volumes"
    echo "  • Access shell: docker compose exec backend sh"
    echo ""
}

# Main demo function
main() {
    print_header
    
    # Check if application is running
    check_application
    
    # Demo API endpoints
    demo_api
    
    # Demo Docker commands
    demo_docker
    
    # Demo application features
    demo_features
    
    # Demo access URLs
    demo_access
    
    # Demo management commands
    demo_commands
    
    echo -e "${GREEN}🎉 Demo completed!${NC}"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "  1. Open http://localhost in your browser"
    echo "  2. Explore the application features"
    echo "  3. Check the documentation: README.md"
    echo "  4. Try the management commands above"
    echo ""
    echo -e "${PURPLE}Happy Recruiting! 🚀${NC}"
}

# Run main function
main "$@"
