import { redisClient } from '../database/redis';
import crypto from 'crypto';

class RevocationManager {
  private prefix = 'revoked:';
  constructor(private redis = redisClient) {}

  async revokeToken(token: string, expiry: number): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await redisClient.setex(
      `${this.prefix}${tokenHash}`,
      expiry,
      '1'
    );
  }

  async isRevoked(token: string): Promise<boolean> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    return Boolean(await redisClient.exists(`${this.prefix}${tokenHash}`));
  }
}

export default new RevocationManager();