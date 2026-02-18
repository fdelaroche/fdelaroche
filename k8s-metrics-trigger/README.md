# Kubernetes Metrics Trigger Application

A Node.js/Express application designed to trigger various Kubernetes container metrics and malfunctions through REST API calls. Perfect for testing monitoring, alerting, and auto-scaling configurations.

## Features

This application can trigger the following Kubernetes metrics:

1. **Liveness Probe Failures** - Causes container restarts
2. **Readiness Probe Failures** - Removes pod from service endpoints
3. **Startup Probe Failures** - Prevents container from starting properly
4. **High CPU Usage** - Triggers CPU-intensive operations
5. **Memory Leaks** - Gradually increases memory consumption
6. **OOMKilled Events** - Forces out-of-memory container kills
7. **High Disk I/O** - Performs intensive disk operations
8. **High Network I/O** - Generates large network responses
9. **Container Crashes** - Forces application exit with specific exit codes
10. **Application Hangs** - Makes application unresponsive
11. **Slow Responses** - Simulates high latency
12. **Error Log Generation** - Creates error events in logs

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Run the application
npm start

# Or with auto-reload
npm run dev
```

The application will start on `http://localhost:3000`

### Docker Build

```bash
# Build the Docker image
docker build -t k8s-metrics-trigger:latest .

# Run locally with Docker
docker run -p 3000:3000 k8s-metrics-trigger:latest
```

### Kubernetes Deployment

```bash
# Create namespace and deploy
kubectl apply -f k8s-deployment.yaml

# Check the deployment
kubectl get pods -n metrics-test
kubectl get svc -n metrics-test

# View logs
kubectl logs -f -n metrics-test deployment/metrics-trigger-app

# Port forward for local access
kubectl port-forward -n metrics-test svc/metrics-trigger-service 3000:80
```

## API Endpoints

### Health Check Endpoints (for K8s probes)

- `GET /healthz/liveness` - Liveness probe endpoint
- `GET /healthz/readiness` - Readiness probe endpoint
- `GET /healthz/startup` - Startup probe endpoint

### Information Endpoints

- `GET /` - List all available endpoints
- `GET /status` - Get current application status and resource usage

### Trigger Endpoints

#### 1. Trigger Liveness Probe Failure

```bash
# Fail the liveness probe (K8s will restart the container)
curl -X POST http://localhost:3000/trigger/liveness-failure

# Restore liveness probe
curl -X POST http://localhost:3000/trigger/liveness-restore
```

**Expected K8s Behavior:** Container will be restarted after 3 consecutive failures (30 seconds)

#### 2. Trigger Readiness Probe Failure

```bash
# Fail the readiness probe (pod removed from service)
curl -X POST http://localhost:3000/trigger/readiness-failure

# Restore readiness probe
curl -X POST http://localhost:3000/trigger/readiness-restore
```

**Expected K8s Behavior:** Pod removed from service endpoints, no traffic routed to it

#### 3. Trigger High CPU Usage

```bash
# Default: 30 seconds, intensity 4
curl -X POST http://localhost:3000/trigger/high-cpu

# Custom duration and intensity
curl -X POST http://localhost:3000/trigger/high-cpu \
  -H "Content-Type: application/json" \
  -d '{"duration": 60000, "intensity": 8}'
```

**Expected K8s Behavior:** CPU usage metric increases, may trigger CPU throttling if limits are set

#### 4. Trigger Memory Leak

```bash
# Allocate 100MB (default)
curl -X POST http://localhost:3000/trigger/memory-leak

# Allocate specific amount
curl -X POST http://localhost:3000/trigger/memory-leak \
  -H "Content-Type: application/json" \
  -d '{"sizeInMB": 200}'

# Clear allocated memory
curl -X POST http://localhost:3000/trigger/clear-memory
```

**Expected K8s Behavior:** Memory usage metric increases, visible in `kubectl top pods`

#### 5. Trigger OOM Kill

```bash
# WARNING: This will crash the container
curl -X POST http://localhost:3000/trigger/oom
```

**Expected K8s Behavior:** 
- Container status: `OOMKilled`
- Exit code: 137
- Container will be restarted
- Restart count increases

#### 6. Trigger High Disk I/O

```bash
# Default: 10 operations of 100MB each
curl -X POST http://localhost:3000/trigger/disk-io

# Custom parameters
curl -X POST http://localhost:3000/trigger/disk-io \
  -H "Content-Type: application/json" \
  -d '{"fileSizeMB": 50, "operations": 20}'
```

**Expected K8s Behavior:** Disk I/O metrics spike, visible in node-level monitoring

#### 7. Trigger High Network I/O

```bash
# Send 10MB response (default)
curl -X POST http://localhost:3000/trigger/network-io

# Custom size
curl -X POST http://localhost:3000/trigger/network-io \
  -H "Content-Type: application/json" \
  -d '{"responseSizeMB": 50}'
```

**Expected K8s Behavior:** Network I/O metrics increase

#### 8. Trigger Application Crash

```bash
# Crash with exit code 1 after 2 seconds
curl -X POST http://localhost:3000/trigger/crash

# Custom exit code and delay
curl -X POST http://localhost:3000/trigger/crash \
  -H "Content-Type: application/json" \
  -d '{"exitCode": 2, "delay": 5000}'
```

**Expected K8s Behavior:** 
- Container terminates with specified exit code
- Restart count increases
- Pod events show crash reason

#### 9. Trigger Infinite Loop (Application Hang)

```bash
# WARNING: This will make the application unresponsive
curl -X POST http://localhost:3000/trigger/infinite-loop
```

**Expected K8s Behavior:** 
- Application stops responding
- Liveness probe will eventually fail
- Container will be restarted

#### 10. Trigger Slow Response

```bash
# 30 second delay (default)
curl -X POST http://localhost:3000/trigger/slow-response

# Custom delay
curl -X POST http://localhost:3000/trigger/slow-response \
  -H "Content-Type: application/json" \
  -d '{"delay": 60000}'
```

**Expected K8s Behavior:** High latency metrics, potential probe timeouts

#### 11. Generate Error Logs

```bash
# Generate 10 error log entries (default)
curl -X POST http://localhost:3000/trigger/errors

# Custom count
curl -X POST http://localhost:3000/trigger/errors \
  -H "Content-Type: application/json" \
  -d '{"count": 50}'
```

**Expected K8s Behavior:** Error events visible in `kubectl logs`

## Monitoring the Metrics

### View Pod Status

```bash
# Get pod status
kubectl get pods -n metrics-test

# Detailed pod information
kubectl describe pod -n metrics-test -l app=metrics-trigger

# Watch pod events
kubectl get events -n metrics-test --watch
```

### View Resource Usage

```bash
# CPU and Memory usage (requires metrics-server)
kubectl top pods -n metrics-test

# Continuous monitoring
watch kubectl top pods -n metrics-test
```

### View Logs

```bash
# Application logs
kubectl logs -f -n metrics-test deployment/metrics-trigger-app

# Previous container logs (after crash)
kubectl logs -n metrics-test deployment/metrics-trigger-app --previous
```

### Check Restart Count

```bash
# View restart count in pod list
kubectl get pods -n metrics-test

# Detailed restart information
kubectl describe pod -n metrics-test -l app=metrics-trigger | grep -A 5 "Restart Count"
```

## Testing Scenarios

### Scenario 1: Test Auto-Restart on Crash

```bash
# 1. Check current restart count
kubectl get pods -n metrics-test

# 2. Trigger a crash
curl -X POST http://localhost:3000/trigger/crash

# 3. Watch pod restart
kubectl get pods -n metrics-test --watch

# 4. Verify restart count increased
kubectl get pods -n metrics-test
```

### Scenario 2: Test Memory Limits and OOM

```bash
# 1. Check current memory usage
kubectl top pods -n metrics-test

# 2. Gradually increase memory
curl -X POST http://localhost:3000/trigger/memory-leak \
  -H "Content-Type: application/json" -d '{"sizeInMB": 100}'

# 3. Check memory again
kubectl top pods -n metrics-test

# 4. Trigger OOM (will crash)
curl -X POST http://localhost:3000/trigger/oom

# 5. Check pod status for OOMKilled
kubectl describe pod -n metrics-test -l app=metrics-trigger
```

### Scenario 3: Test Readiness Probe and Service Endpoints

```bash
# 1. Check service endpoints
kubectl get endpoints -n metrics-test metrics-trigger-service

# 2. Fail readiness probe
curl -X POST http://localhost:3000/trigger/readiness-failure

# 3. Wait 10 seconds, check endpoints again (pod should be removed)
kubectl get endpoints -n metrics-test metrics-trigger-service

# 4. Restore readiness
curl -X POST http://localhost:3000/trigger/readiness-restore

# 5. Verify pod is back in endpoints
kubectl get endpoints -n metrics-test metrics-trigger-service
```

## Resource Configuration

The Kubernetes deployment includes:

- **Memory Request:** 128Mi
- **Memory Limit:** 512Mi (intentionally low for easy OOM testing)
- **CPU Request:** 100m
- **CPU Limit:** 500m

You can adjust these in `k8s-deployment.yaml` to test different scenarios.

## Cleanup

```bash
# Delete the deployment
kubectl delete -f k8s-deployment.yaml

# Or delete the namespace
kubectl delete namespace metrics-test
```

## Advanced Usage with Prometheus

If you have Prometheus monitoring set up, you can query these metrics:

```promql
# Container restarts
rate(kube_pod_container_status_restarts_total[5m])

# Memory usage
container_memory_usage_bytes{pod=~"metrics-trigger.*"}

# CPU usage
rate(container_cpu_usage_seconds_total{pod=~"metrics-trigger.*"}[1m])

# OOM kills
kube_pod_container_status_last_terminated_reason{reason="OOMKilled"}
```

## Troubleshooting

### Pod Won't Start

Check the events:
```bash
kubectl describe pod -n metrics-test -l app=metrics-trigger
```

### Can't Access the Service

Port forward directly to the pod:
```bash
kubectl port-forward -n metrics-test deployment/metrics-trigger-app 3000:3000
```

### Metrics Not Showing

Ensure metrics-server is installed:
```bash
kubectl top nodes
```

## License

MIT
