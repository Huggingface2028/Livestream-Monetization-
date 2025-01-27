import { Registry, Counter, Histogram } from 'prom-client';

const registry = new Registry();

export const httpRequestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status'],
  registers: [registry]
});

export const authStateValidationCounter = new Counter({
  name: 'auth_state_validation_total',
  help: 'State parameter validation results',
  labelNames: ['result'],
  registers: [registry]
});

export const sessionStoreOpsDuration = new Histogram({
  name: 'redis_session_ops_duration_seconds',
  help: 'Duration of Redis session operations',
  labelNames: ['operation'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1],
  registers: [registry]
});

export const getMetrics = () => registry.metrics();
