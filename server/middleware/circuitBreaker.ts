import { RequestHandler } from 'express';
import { CircuitBreaker } from 'opossum';
import { logger } from '../logger';

const circuitBreakerOptions = {
  timeout: 3000, // If our function takes longer than 3 seconds, trigger a failure
  errorThresholdPercentage: 50, // When 50% of requests fail, trip the circuit
  resetTimeout: 10000 // After 10 seconds, try again.
};

const circuitBreaker = new CircuitBreaker((req, res) => {
  return Promise.resolve();
}, circuitBreakerOptions);

circuitBreaker.on('open', () => logger.warn('CIRCUIT BREAKER OPEN'));
circuitBreaker.on('halfOpen', () => logger.info('CIRCUIT BREAKER HALF_OPEN'));
circuitBreaker.on('close', () => logger.info('CIRCUIT BREAKER CLOSED'));

export const circuitBreakerMiddleware: RequestHandler = (req, res, next) => {
  circuitBreaker.fire(req, res)
    .then(() => next())
    .catch(err => {
      logger.error('Circuit breaker error:', err);
      res.status(503).send('Service Unavailable');
    });
};
