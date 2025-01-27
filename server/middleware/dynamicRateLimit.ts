import { RateLimiterRedis } from 'rate-limiter-flexible';
import { redisClient } from '../database/redis';

const limiter = new RateLimiterRedis({
  storeClient: redisClient, // Use shared Redis client
  points: 15,
  duration: 60,
  blockDuration: 600, // 10 minutes
  keyPrefix: 'rate_limit:',
  insuranceLimiter: new RateLimiterRedis({
    storeClient: redisClient, // Use shared Redis client
    points: 100, 
    duration: 60,
    blockDuration: 600 // 10 minutes
  })
});

export const authRateLimiter = (req, res, next) => {
  const identifier = req.user?.id || req.ip;

  limiter.consume(identifier)
    .then(() => next())
    .catch(() => res.status(429).json({
      error: 'Too many requests - please try again later',
      retryAfter: 600
    }));
};
