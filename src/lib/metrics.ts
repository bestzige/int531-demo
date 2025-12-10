import client from 'prom-client';

export const register = new client.Registry();

client.collectDefaultMetrics({ register });

export const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
});
register.registerMetric(httpRequestsTotal);

export const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5],
});
register.registerMetric(httpRequestDurationSeconds);

export const httpRequestsErrorsTotal = new client.Counter({
  name: 'http_requests_errors_total',
  help: 'Total failed HTTP requests',
  labelNames: ['method', 'route', 'status'],
});
register.registerMetric(httpRequestsErrorsTotal);

export const activeRequests = new client.Gauge({
  name: 'active_requests',
  help: 'Number of active requests',
});
register.registerMetric(activeRequests);
