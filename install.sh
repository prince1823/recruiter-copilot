#!/bin/bash

# Recruiter Copilot Dashboard - Installation Script
# This script helps users install and run the application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}  Recruiter Copilot Dashboard  ${NC}"
    echo -e "${PURPLE}     Installation Script       ${NC}"
    echo -e "${PURPLE}================================${NC}"
    echo ""
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
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

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Check if running on macOS, Linux, or Windows
detect_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macOS"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="Linux"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        OS="Windows"
    else
        OS="Unknown"
    fi
    print_info "Detected operating system: $OS"
}

# Check if Docker is installed
check_docker() {
    print_step "Checking Docker installation..."
    
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        print_success "Docker is installed: $DOCKER_VERSION"
        
        # Check if Docker daemon is running
        if docker info &> /dev/null; then
            print_success "Docker daemon is running"
            return 0
        else
            print_error "Docker is installed but not running"
            print_info "Please start Docker Desktop and try again"
            return 1
        fi
    else
        print_error "Docker is not installed"
        return 1
    fi
}

# Install Docker instructions
install_docker_instructions() {
    print_step "Docker Installation Instructions"
    echo ""
    case $OS in
        "macOS")
            echo "For macOS:"
            echo "1. Go to https://www.docker.com/products/docker-desktop/"
            echo "2. Download Docker Desktop for Mac"
            echo "3. Install and start Docker Desktop"
            echo "4. Run this script again"
            ;;
        "Linux")
            echo "For Linux (Ubuntu/Debian):"
            echo "sudo apt-get update"
            echo "sudo apt-get install docker.io docker-compose-plugin"
            echo "sudo systemctl start docker"
            echo "sudo systemctl enable docker"
            echo ""
            echo "For other Linux distributions, visit:"
            echo "https://docs.docker.com/engine/install/"
            ;;
        "Windows")
            echo "For Windows:"
            echo "1. Go to https://www.docker.com/products/docker-desktop/"
            echo "2. Download Docker Desktop for Windows"
            echo "3. Install and start Docker Desktop"
            echo "4. Run this script again"
            ;;
        *)
            echo "Please visit https://www.docker.com/products/docker-desktop/"
            echo "and download Docker for your operating system"
            ;;
    esac
    echo ""
}

# Check if Docker Compose is available
check_docker_compose() {
    print_step "Checking Docker Compose..."
    
    if docker compose version &> /dev/null; then
        COMPOSE_VERSION=$(docker compose version)
        print_success "Docker Compose is available: $COMPOSE_VERSION"
        return 0
    else
        print_error "Docker Compose is not available"
        print_info "Docker Compose should be included with Docker Desktop"
        return 1
    fi
}

# Check if we're in the right directory
check_project_files() {
    print_step "Checking project files..."
    
    if [[ -f "docker-compose.yml" ]] && [[ -f "deploy.sh" ]]; then
        print_success "Project files found"
        return 0
    else
        print_error "Project files not found"
        print_info "Please make sure you're in the correct directory"
        print_info "Expected files: docker-compose.yml, deploy.sh"
        return 1
    fi
}

# Make scripts executable
make_scripts_executable() {
    print_step "Making scripts executable..."
    
    if [[ -f "deploy.sh" ]]; then
        chmod +x deploy.sh
        print_success "deploy.sh is now executable"
    fi
    
    if [[ -f "test-docker.sh" ]]; then
        chmod +x test-docker.sh
        print_success "test-docker.sh is now executable"
    fi
}

# Deploy the application
deploy_application() {
    print_step "Deploying the application..."
    
    if [[ -f "deploy.sh" ]]; then
        print_info "Running deployment script..."
        ./deploy.sh
    else
        print_error "deploy.sh not found"
        return 1
    fi
}

# Test the deployment
test_deployment() {
    print_step "Testing the deployment..."
    
    if [[ -f "test-docker.sh" ]]; then
        print_info "Running test script..."
        ./test-docker.sh
    else
        print_warning "test-docker.sh not found, skipping tests"
    fi
}

# Show final instructions
show_final_instructions() {
    echo ""
    print_success "Installation completed successfully!"
    echo ""
    echo -e "${GREEN}🎉 Your Recruiter Copilot Dashboard is now running!${NC}"
    echo ""
    echo -e "${BLUE}Access your application at:${NC}"
    echo -e "  • Frontend: ${YELLOW}http://localhost${NC}"
    echo -e "  • Backend API: ${YELLOW}http://localhost:3000${NC}"
    echo ""
    echo -e "${BLUE}Useful commands:${NC}"
    echo -e "  • Stop application: ${YELLOW}docker compose down${NC}"
    echo -e "  • Start application: ${YELLOW}docker compose up -d${NC}"
    echo -e "  • View logs: ${YELLOW}docker compose logs -f${NC}"
    echo -e "  • Test deployment: ${YELLOW}./test-docker.sh${NC}"
    echo ""
    echo -e "${BLUE}For more information, see:${NC}"
    echo -e "  • Quick Start Guide: ${YELLOW}QUICK_START.md${NC}"
    echo -e "  • Full Documentation: ${YELLOW}README.md${NC}"
    echo ""
    echo -e "${GREEN}Happy Recruiting! 🚀${NC}"
}

# Main installation process
main() {
    print_header
    
    # Detect operating system
    detect_os
    
    # Check Docker installation
    if ! check_docker; then
        install_docker_instructions
        exit 1
    fi
    
    # Check Docker Compose
    if ! check_docker_compose; then
        print_error "Docker Compose is required but not available"
        exit 1
    fi
    
    # Check project files
    if ! check_project_files; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
    
    # Make scripts executable
    make_scripts_executable
    
    # Deploy the application
    if ! deploy_application; then
        print_error "Deployment failed. Please check the logs above."
        exit 1
    fi
    
    # Test the deployment
    test_deployment
    
    # Show final instructions
    show_final_instructions
}

# Run main function
main "$@"
