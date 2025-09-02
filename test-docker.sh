#!/bin/bash

# Docker Test Script for Recruiter Copilot
# This script tests the Docker deployment

set -e

echo "🧪 Testing Docker Deployment..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# Test 1: Check if containers are running
print_status "Checking if containers are running..."
if docker compose ps | grep -q "Up"; then
    print_success "Containers are running"
else
    print_error "Containers are not running"
    exit 1
fi

# Test 2: Check backend health
print_status "Testing backend health endpoint..."
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    print_success "Backend health check passed"
else
    print_error "Backend health check failed"
fi

# Test 3: Check frontend accessibility
print_status "Testing frontend accessibility..."
if curl -f http://localhost > /dev/null 2>&1; then
    print_success "Frontend is accessible"
else
    print_error "Frontend is not accessible"
fi

# Test 4: Check API proxy
print_status "Testing API proxy..."
if curl -f http://localhost/api/data > /dev/null 2>&1; then
    print_success "API proxy is working"
else
    print_error "API proxy is not working"
fi

echo ""
echo "🎉 Docker deployment test completed!"
echo "Access your application at: http://localhost"
