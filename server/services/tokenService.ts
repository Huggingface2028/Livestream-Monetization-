import { redisClient } from '../database/redis';
import { verifyToken } from '../middleware/auth';

const LOCK_KEY_PREFIX = `${process.env.REDIS_KEY_PREFIX}:refresh-lock`;
const LOCK_TTL = 5000; // 5 seconds

class TokenService {
  async refreshToken(userId: string, oldRefreshToken: string): Promise<string> {
    const lockKey = `${LOCK_KEY_PREFIX}:${userId}`;
    
    // Acquire distributed lock
    const lock = await redisClient.set(
      lockKey,
      'LOCKED',
      'PX',
      LOCK_TTL,
      'NX'
    );

    if (!lock) {
      return this.waitForExistingRefresh(userId);
    }

    try {
      const decoded = verifyToken(oldRefreshToken);
      const newTokens = await refreshTikTokToken(oldRefreshToken);
      
      await TokenModel.findOneAndUpdate(
        { userId },
        { 
          accessToken: newTokens.access_token,
          refreshToken: newTokens.refresh_token,
          version: { $inc: 1 }
        },
        { new: true, upsert: true }
      );

      return newTokens.access_token;
    } finally {
      await redisClient.del(lockKey);
    }
  }

  private async waitForExistingRefresh(userId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const channel = `${LOCK_KEY_PREFIX}:${userId}:complete`;
      
      redisClient.subscribe(channel, (err) => {
        if (err) reject(err);
      });

      redisClient.on('message', (ch, message) => {
        if (ch === channel) {
          redisClient.unsubscribe(channel);
          resolve(message);
        }
      });

      setTimeout(() => {
        redisClient.unsubscribe(channel);
        reject(new Error('Refresh operation timed out'));
      }, LOCK_TTL);
    });
  }
}