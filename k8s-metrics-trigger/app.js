const express = require('express');
const os = require('os');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health check endpoints for K8s probes
let livenessHealthy = true;
let readinessHealthy = true;
let startupHealthy = true;

// Memory leak storage
let memoryLeakArray = [];

// CPU intensive task flag
let cpuIntensiveRunning = false;

// ===========================
// HEALTH PROBE ENDPOINTS
// ===========================

app.get('/healthz/liveness', (req, res) => {
  if (livenessHealthy) {
    res.status(200).send('OK');
  } else {
    res.status(500).send('Liveness probe failed');
  }
});

app.get('/healthz/readiness', (req, res) => {
  if (readinessHealthy) {
    res.status(200).send('OK');
  } else {
    res.status(503).send('Readiness probe failed');
  }
});

app.get('/healthz/startup', (req, res) => {
  if (startupHealthy) {
    res.status(200).send('OK');
  } else {
    res.status(500).send('Startup probe failed');
  }
});

// ===========================
// METRIC TRIGGER ENDPOINTS
// ===========================

// 1. Trigger Liveness Probe Failure
app.post('/trigger/liveness-failure', (req, res) => {
  livenessHealthy = false;
  console.log('Liveness probe set to fail - container will be restarted by K8s');
  res.json({ 
    message: 'Liveness probe will now fail. K8s will restart the container.',
    metric: 'liveness_probe_failure'
  });
});

app.post('/trigger/liveness-restore', (req, res) => {
  livenessHealthy = true;
  console.log('Liveness probe restored to healthy');
  res.json({ message: 'Liveness probe restored',
    metric: 'liveness_probe_failure'
  });
});

// 2. Trigger Readiness Probe Failure
app.post('/trigger/readiness-failure', (req, res) => {
  readinessHealthy = false;
  console.log('Readiness probe set to fail - pod will be removed from service endpoints');
  res.json({ 
    message: 'Readiness probe will now fail. Pod removed from load balancer.',
    metric: 'readiness_probe_failure'
  });
});

app.post('/trigger/readiness-restore', (req, res) => {
  readinessHealthy = true;
  console.log('Readiness probe restored to healthy');
  res.json({ message: 'Readiness probe restored',
    metric: 'readiness_probe_failure'
  });
});

// 3. Trigger Startup Probe Failure
app.post('/trigger/startup-failure', (req, res) => {
  startupHealthy = false;
  console.log('Startup probe set to fail');
  res.json({ 
    message: 'Startup probe will now fail.',
    metric: 'startup_probe_failure'
  });
});

// 4. Trigger High CPU Usage
app.post('/trigger/high-cpu', (req, res) => {
  const duration = req.body.duration || 30000; // default 30 seconds
  const intensity = req.body.intensity || 4; // number of parallel operations
  
  if (cpuIntensiveRunning) {
    return res.json({ message: 'CPU intensive task already running' });
  }

  cpuIntensiveRunning = true;
  console.log(`Starting CPU intensive task for ${duration}ms with intensity ${intensity}`);
  
  res.json({ 
    message: `High CPU usage triggered for ${duration}ms`,
    metric: 'cpu_usage',
    intensity: intensity
  });

  // CPU intensive operation
  const workers = [];
  for (let w = 0; w < intensity; w++) {
    const worker = setInterval(() => {
      const start = Date.now();
      // Perform CPU-intensive calculation
      while (Date.now() - start < 100) {
        Math.sqrt(Math.random() * 1000000);
      }
    }, 0);
    workers.push(worker);
  }

  setTimeout(() => {
    workers.forEach(w => clearInterval(w));
    cpuIntensiveRunning = false;
    console.log('CPU intensive task completed');
  }, duration);
});

// 5. Trigger Memory Leak (High Memory Usage)
app.post('/trigger/memory-leak', (req, res) => {
  const sizeInMB = req.body.sizeInMB || 100;
  const chunkSize = 1024 * 1024; // 1MB chunks
  
  console.log(`Allocating ${sizeInMB}MB of memory`);
  
  for (let i = 0; i < sizeInMB; i++) {
    // Allocate 1MB of memory
    const chunk = Buffer.alloc(chunkSize);
    chunk.fill('x'); // Fill with data to prevent optimization
    memoryLeakArray.push(chunk);
  }
  
  const usage = process.memoryUsage();
  res.json({ 
    message: `Allocated ${sizeInMB}MB of memory`,
    metric: 'memory_usage',
    currentMemoryMB: Math.round(usage.heapUsed / 1024 / 1024),
    totalAllocatedMB: Math.round(memoryLeakArray.length),
    rss: Math.round(usage.rss / 1024 / 1024)
  });
});

// 6. Trigger OOMKilled (Out of Memory)
app.post('/trigger/oom', (req, res) => {
  console.log('Attempting to trigger OOM by allocating massive memory...');
  res.json({ 
    message: 'Attempting to allocate memory until OOMKilled',
    metric: 'oom_killed',
    warning: 'This will crash the container'
  });

  // Aggressive memory allocation
  setTimeout(() => {
    const arrays = [];
    try {
      while (true) {
        // Allocate 50MB chunks rapidly
        const huge = Buffer.alloc(50 * 1024 * 1024);
        huge.fill('x');
        arrays.push(huge);
      }
    } catch (e) {
      console.error('Memory allocation failed:', e.message);
    }
  }, 100);
});

// 7. Clear Memory Leak
app.post('/trigger/clear-memory', (req, res) => {
  const before = process.memoryUsage();
  memoryLeakArray = [];
  
  if (global.gc) {
    global.gc();
  }
  
  const after = process.memoryUsage();
  console.log('Memory cleared');
  
  res.json({ 
    message: 'Memory leak cleared',
    beforeMB: Math.round(before.heapUsed / 1024 / 1024),
    afterMB: Math.round(after.heapUsed / 1024 / 1024)
  });
});

// 8. Trigger High Disk I/O
app.post('/trigger/disk-io', (req, res) => {
  const fileSizeMB = req.body.fileSizeMB || 100;
  const operations = req.body.operations || 10;
  const directory = '/tmp/k8s-disk-test';
  
  console.log(`Starting disk I/O test: ${operations} operations of ${fileSizeMB}MB each`);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
  
  res.json({ 
    message: `High disk I/O triggered: ${operations} operations of ${fileSizeMB}MB`,
    metric: 'disk_io'
  });

  // Perform disk operations asynchronously
  setTimeout(() => {
    for (let i = 0; i < operations; i++) {
      const filename = path.join(directory, `test-file-${i}.dat`);
      const buffer = Buffer.alloc(fileSizeMB * 1024 * 1024, 'a');
      
      // Write
      fs.writeFileSync(filename, buffer);
      // Read
      fs.readFileSync(filename);
      // Delete
      fs.unlinkSync(filename);
    }
    console.log('Disk I/O test completed');
  }, 100);
});

// 9. Trigger High Network I/O
app.post('/trigger/network-io', (req, res) => {
  const responseSize = req.body.responseSizeMB || 10;
  const buffer = Buffer.alloc(responseSize * 1024 * 1024, 'x');
  
  console.log(`Sending ${responseSize}MB response`);
  res.json({ 
    message: `Sending ${responseSize}MB of data`,
    metric: 'network_io',
    data: buffer.toString('base64')
  });
});

// 10. Trigger Application Crash (Exit Code)
app.post('/trigger/crash', (req, res) => {
  const exitCode = req.body.exitCode || 1;
  const delay = req.body.delay || 2000;
  
  console.log(`Application will crash with exit code ${exitCode} in ${delay}ms`);
  res.json({ 
    message: `Application will crash in ${delay}ms with exit code ${exitCode}`,
    metric: 'restart_count'
  });

  setTimeout(() => {
    console.error('CRASHING APPLICATION');
    process.exit(exitCode);
  }, delay);
});

// 11. Trigger Infinite Loop (Unresponsive)
app.post('/trigger/infinite-loop', (req, res) => {
  console.log('Starting infinite loop - application will become unresponsive');
  res.json({ 
    message: 'Infinite loop triggered - application will hang',
    metric: 'container_unresponsive'
  });

  setTimeout(() => {
    console.log('Entering infinite loop...');
    while (true) {
      // Infinite loop
    }
  }, 100);
});

// 12. Trigger Slow Response (High Latency)
app.post('/trigger/slow-response', (req, res) => {
  const delay = req.body.delay || 30000; // 30 seconds default
  
  console.log(`Delaying response by ${delay}ms`);
  
  setTimeout(() => {
    res.json({ 
      message: `Response delayed by ${delay}ms`,
      metric: 'response_latency'
    });
  }, delay);
});

// 13. Generate Application Errors (Event Logs)
app.post('/trigger/errors', (req, res) => {
  const count = req.body.count || 10;
  
  console.log(`Generating ${count} error log entries`);
  res.json({ 
    message: `Generating ${count} error log entries`,
    metric: 'error_events'
  });

  for (let i = 0; i < count; i++) {
    console.error(`ERROR ${i + 1}: Simulated application error - Critical failure in component X`);
  }
});

// ===========================
// STATUS AND INFO ENDPOINTS
// ===========================

app.get('/status', (req, res) => {
  const usage = process.memoryUsage();
  const cpus = os.cpus();
  
  res.json({
    status: 'running',
    uptime: process.uptime(),
    memory: {
      heapUsedMB: Math.round(usage.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(usage.heapTotal / 1024 / 1024),
      rssMB: Math.round(usage.rss / 1024 / 1024),
      externalMB: Math.round(usage.external / 1024 / 1024),
      leakArrayMB: memoryLeakArray.length
    },
    cpu: {
      count: cpus.length,
      model: cpus[0].model,
      intensiveTaskRunning: cpuIntensiveRunning
    },
    probes: {
      liveness: livenessHealthy,
      readiness: readinessHealthy,
      startup: startupHealthy
    }
  });
});

app.get('/', (req, res) => {
  res.json({
    app: 'Kubernetes Metrics Trigger Application',
    version: '1.0.0',
    endpoints: {
      health: {
        'GET /healthz/liveness': 'Liveness probe endpoint',
        'GET /healthz/readiness': 'Readiness probe endpoint',
        'GET /healthz/startup': 'Startup probe endpoint'
      },
      triggers: {
        'POST /trigger/liveness-failure': 'Fail liveness probe',
        'POST /trigger/readiness-failure': 'Fail readiness probe',
        'POST /trigger/high-cpu': 'High CPU usage (body: {duration: ms, intensity: number})',
        'POST /trigger/memory-leak': 'Allocate memory (body: {sizeInMB: number})',
        'POST /trigger/oom': 'Trigger Out of Memory kill',
        'POST /trigger/clear-memory': 'Clear allocated memory',
        'POST /trigger/disk-io': 'High disk I/O (body: {fileSizeMB: number, operations: number})',
        'POST /trigger/network-io': 'High network I/O (body: {responseSizeMB: number})',
        'POST /trigger/crash': 'Crash application (body: {exitCode: number, delay: ms})',
        'POST /trigger/infinite-loop': 'Hang application with infinite loop',
        'POST /trigger/slow-response': 'Slow API response (body: {delay: ms})',
        'POST /trigger/errors': 'Generate error logs (body: {count: number})'
      },
      info: {
        'GET /': 'This endpoint',
        'GET /status': 'Current application status and metrics'
      }
    }
  });
});

// Start server
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`K8s Metrics Trigger App listening on port ${port}`);
  console.log(`PID: ${process.pid}`);
  console.log('Ready to trigger various Kubernetes metrics!');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
