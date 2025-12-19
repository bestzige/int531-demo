import client from 'prom-client';

export const register = new client.Registry();

register.setDefaultLabels({
  service: 'api',
});

client.collectDefaultMetrics({
  register,
  prefix: 'api_node_',
});

/**
 * =========================
 * TRAFFIC
 * =========================
 */
export const apiHttpRequestsTotal = new client.Counter({
  name: 'api_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});
register.registerMetric(apiHttpRequestsTotal);

/**
 * =========================
 * LATENCY
 * =========================
 */
export const apiHttpRequestDurationSeconds = new client.Histogram({
  name: 'api_http_request_duration_seconds',
  help: 'HTTP request latency',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.05, 0.1, 0.2, 0.3, 0.5, 0.75, 1, 1.5, 2, 3, 5],
});
register.registerMetric(apiHttpRequestDurationSeconds);

/**
 * =========================
 * ERRORS
 * =========================
 */
export const apiHttpRequestsErrorsTotal = new client.Counter({
  name: 'api_http_requests_errors_total',
  help: 'Total number of failed HTTP requests',
  labelNames: ['method', 'route', 'status'],
});
register.registerMetric(apiHttpRequestsErrorsTotal);

/**
 * =========================
 * SATURATION
 * =========================
 */
export const apiHttpRequestsInFlight = new client.Gauge({
  name: 'api_http_requests_in_flight',
  help: 'Number of HTTP requests currently being processed',
});
register.registerMetric(apiHttpRequestsInFlight);

/*========================== FRONTEND METRICS ==========================*/
// Traffic
export const frontendRequests = new client.Counter({
  name: 'frontend_requests_total',
  help: 'Total frontend requests',
  labelNames: ['type'],
});
register.registerMetric(frontendRequests);

// Errors
export const frontendErrors = new client.Counter({
  name: 'frontend_errors_total',
  help: 'Total frontend errors',
  labelNames: ['type'],
});
register.registerMetric(frontendErrors);

// Latency
export const frontendLatency = new client.Histogram({
  name: 'frontend_latency_seconds',
  help: 'Frontend latency',
  labelNames: ['type'],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5],
});
register.registerMetric(frontendLatency);
