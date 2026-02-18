#!/bin/bash

# Kubernetes Metrics Trigger - Test Script
# This script demonstrates all the available endpoints

set -e

# Configuration
HOST="${1:-http://localhost:3000}"
DELAY=2

echo "===================================="
echo "K8s Metrics Trigger - Test Script"
echo "Target: $HOST"
echo "===================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

function print_header() {
    echo -e "${GREEN}===================================="
    echo -e "$1"
    echo -e "====================================${NC}"
}

function print_warning() {
    echo -e "${YELLOW}WARNING: $1${NC}"
}

function print_error() {
    echo -e "${RED}ERROR: $1${NC}"
}

function wait_for_input() {
    echo ""
    read -p "Press Enter to continue..."
    echo ""
}

# Test 1: Check if service is running
print_header "TEST 1: Check Service Status"
echo "Checking if service is available..."
if curl -s "$HOST/" > /dev/null; then
    echo -e "${GREEN}✓ Service is running${NC}"
else
    print_error "Service is not accessible at $HOST"
    exit 1
fi
sleep $DELAY

# Test 2: Get current status
print_header "TEST 2: Get Current Status"
curl -s "$HOST/status" | jq '.'
wait_for_input

# Test 3: Health check endpoints
print_header "TEST 3: Health Check Endpoints"
echo "Testing liveness probe..."
curl -s "$HOST/healthz/liveness"
echo ""
echo "Testing readiness probe..."
curl -s "$HOST/healthz/readiness"
echo ""
echo "Testing startup probe..."
curl -s "$HOST/healthz/startup"
echo ""
wait_for_input

# Test 4: Trigger Readiness Probe Failure
print_header "TEST 4: Readiness Probe Failure"
print_warning "This will fail the readiness probe (pod removed from service)"
echo "Failing readiness probe..."
curl -s -X POST "$HOST/trigger/readiness-failure" | jq '.'
echo ""
echo "Waiting 5 seconds..."
sleep 5
echo "Checking readiness probe (should fail)..."
curl -s "$HOST/healthz/readiness" || echo -e "\n${YELLOW}Readiness probe is failing as expected${NC}"
echo ""
echo "Restoring readiness probe..."
curl -s -X POST "$HOST/trigger/readiness-restore" | jq '.'
wait_for_input

# Test 5: Trigger High CPU Usage
print_header "TEST 5: High CPU Usage"
print_warning "This will consume CPU for 10 seconds"
curl -s -X POST "$HOST/trigger/high-cpu" \
  -H "Content-Type: application/json" \
  -d '{"duration": 10000, "intensity": 4}' | jq '.'
echo "CPU intensive task running... (monitor with 'kubectl top pods' or 'top')"
wait_for_input

# Test 6: Trigger Memory Leak
print_header "TEST 6: Memory Leak (Allocate 50MB)"
echo "Current memory usage:"
curl -s "$HOST/status" | jq '.memory'
echo ""
echo "Allocating 50MB..."
curl -s -X POST "$HOST/trigger/memory-leak" \
  -H "Content-Type: application/json" \
  -d '{"sizeInMB": 50}' | jq '.'
echo ""
echo "New memory usage:"
curl -s "$HOST/status" | jq '.memory'
wait_for_input

# Test 7: Clear Memory
print_header "TEST 7: Clear Allocated Memory"
curl -s -X POST "$HOST/trigger/clear-memory" | jq '.'
echo ""
echo "Memory after clearing:"
curl -s "$HOST/status" | jq '.memory'
wait_for_input

# Test 8: Trigger High Disk I/O
print_header "TEST 8: High Disk I/O"
print_warning "This will perform intensive disk operations"
curl -s -X POST "$HOST/trigger/disk-io" \
  -H "Content-Type: application/json" \
  -d '{"fileSizeMB": 10, "operations": 5}' | jq '.'
echo "Disk I/O operations running..."
wait_for_input

# Test 9: Generate Error Logs
print_header "TEST 9: Generate Error Logs"
curl -s -X POST "$HOST/trigger/errors" \
  -H "Content-Type: application/json" \
  -d '{"count": 5}' | jq '.'
echo "Check application logs for error entries"
wait_for_input

# Test 10: Trigger Slow Response
print_header "TEST 10: Slow Response (5 seconds)"
echo "Triggering slow response..."
curl -s -X POST "$HOST/trigger/slow-response" \
  -H "Content-Type: application/json" \
  -d '{"delay": 5000}' | jq '.'
wait_for_input

# Destructive tests section
echo ""
echo -e "${RED}========================================${NC}"
echo -e "${RED}DESTRUCTIVE TESTS${NC}"
echo -e "${RED}========================================${NC}"
echo "The following tests will cause issues that require intervention:"
echo "- Liveness probe failure (container restart)"
echo "- OOM Kill (container crash)"
echo "- Application crash"
echo "- Infinite loop (application hang)"
echo ""
read -p "Do you want to run destructive tests? (yes/no): " run_destructive

if [ "$run_destructive" == "yes" ]; then
    # Test 11: Liveness Probe Failure
    print_header "DESTRUCTIVE TEST 1: Liveness Probe Failure"
    print_warning "Container will be restarted by K8s after ~30 seconds"
    read -p "Continue? (yes/no): " confirm
    if [ "$confirm" == "yes" ]; then
        curl -s -X POST "$HOST/trigger/liveness-failure" | jq '.'
        echo "Liveness probe will now fail. Monitor with: kubectl get pods -w"
    fi
    echo ""
    
    # Test 12: Application Crash
    print_header "DESTRUCTIVE TEST 2: Application Crash"
    print_warning "Application will crash in 5 seconds"
    read -p "Continue? (yes/no): " confirm
    if [ "$confirm" == "yes" ]; then
        curl -s -X POST "$HOST/trigger/crash" \
          -H "Content-Type: application/json" \
          -d '{"exitCode": 1, "delay": 5000}' | jq '.'
        echo "Application will crash shortly..."
    fi
    echo ""
    
    # Note: OOM and Infinite Loop tests are too destructive to run automatically
    echo -e "${YELLOW}Note: OOM Kill and Infinite Loop tests are skipped in this script${NC}"
    echo "To test manually:"
    echo "  OOM Kill: curl -X POST $HOST/trigger/oom"
    echo "  Infinite Loop: curl -X POST $HOST/trigger/infinite-loop"
else
    echo "Skipping destructive tests"
fi

echo ""
print_header "Test Script Complete!"
echo "For monitoring in Kubernetes, use:"
echo "  kubectl get pods -n metrics-test --watch"
echo "  kubectl top pods -n metrics-test"
echo "  kubectl logs -f -n metrics-test deployment/metrics-trigger-app"
echo "  kubectl describe pod -n metrics-test -l app=metrics-trigger"
