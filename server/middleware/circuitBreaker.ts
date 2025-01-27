import { redisClient } from '../database/redis';

const CIRCUIT_BREAKER_KEY = `${process.env.REDIS_KEY_PREFIX}:circuit-breaker`;

interface CircuitBreakerState {
  state: 'OPEN' | 'CLOSED' | 'HALF_OPEN';
  failureCount: number;
  lastFailure: number;
}

export class CircuitBreaker {
  private static readonly threshold = 5;
  private static readonly resetTimeout = 30000;

  static async getState(): Promise<CircuitBreakerState> {
    const state = await redisClient.get(CIRCUIT_BREAKER_KEY);
    return state ? JSON.parse(state) : {
      state: 'CLOSED',
      failureCount: 0,
      lastFailure: 0
    };
  }

  public static getResetTimeout(): number {
    return this.resetTimeout;
  }

  static async trackFailure() {
    const multi = redisClient.multi();
    multi.incrby(`${CIRCUIT_BREAKER_KEY}:failureCount`, 1);
    multi.set(`${CIRCUIT_BREAKER_KEY}:lastFailure`, Date.now());
    
    const [count] = await multi.exec();
    
    if (count >= this.threshold) {
      await redisClient.setex(CIRCUIT_BREAKER_KEY, 
        this.resetTimeout / 1000, 
        JSON.stringify({
          state: 'OPEN',
          failureCount: count,
          lastFailure: Date.now()
        })
      );
      
      setTimeout(() => {
        redisClient.set(CIRCUIT_BREAKER_KEY, JSON.stringify({
          state: 'HALF_OPEN',
          failureCount: 0,
          lastFailure: 0
        }));
      }, this.resetTimeout);
    }
  }

  static async reset() {
    await redisClient.del(CIRCUIT_BREAKER_KEY);
  }
}

redisClient.on('error', async (err) => {
  if (err.message.includes('ECONNREFUSED')) {
    await CircuitBreaker.trackFailure();
  }
});

export const redisCircuitBreaker = async (req, res, next) => {
  const state = await CircuitBreaker.getState();
  
  if (state.state === 'OPEN') {
    return res.status(503).json({ 
      error: 'Service unavailable',
      retryAfter: CircuitBreaker.getResetTimeout() / 1000 
    });
  }
  
  next();
};