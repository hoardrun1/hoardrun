import promClient from 'prom-client'
import { Express } from 'express'

// Create metrics
const collectDefaultMetrics = promClient.collectDefaultMetrics
const Registry = promClient.Registry
const register = new Registry()

// Custom metrics
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.5, 1, 2, 5]
})

const wsConnectionsGauge = new promClient.Gauge({
  name: 'ws_connections_total',
  help: 'Number of active WebSocket connections'
})

const transactionCounter = new promClient.Counter({
  name: 'transactions_total',
  help: 'Total number of transactions',
  labelNames: ['type', 'status']
})

const balanceGauge = new promClient.Gauge({
  name: 'user_balance',
  help: 'Current user balance',
  labelNames: ['userId']
})

export function setupMonitoring(app: Express) {
  // Enable default metrics
  collectDefaultMetrics({ register })

  // Register custom metrics
  register.registerMetric(httpRequestDurationMicroseconds)
  register.registerMetric(wsConnectionsGauge)
  register.registerMetric(transactionCounter)
  register.registerMetric(balanceGauge)

  // Metrics endpoint for Prometheus
  app.get('/metrics', async (req, res) => {
    try {
      res.set('Content-Type', register.contentType)
      res.end(await register.metrics())
    } catch (error) {
      res.status(500).end(error)
    }
  })

  // Middleware to measure request duration
  app.use((req, res, next) => {
    const start = Date.now()
    res.on('finish', () => {
      const duration = Date.now() - start
      httpRequestDurationMicroseconds
        .labels(req.method, req.path, res.statusCode.toString())
        .observe(duration / 1000)
    })
    next()
  })

  return {
    wsConnectionsGauge,
    transactionCounter,
    balanceGauge
  }
} 