import { redisClient } from '../database/redis';
import * as crypto from 'crypto';

const STATE_TTL = 300;

class StateManager {
  private prefix = 'oauth_state:';

  async createState(userId: string): Promise<string> {
    const state = crypto.randomBytes(32).toString('hex');
    await redisClient.setex(
      `${this.prefix}${state}`, 
      STATE_TTL, 
      JSON.stringify({ userId, timestamp: Date.now() })
    );
    return state;
  }

  async validateState(state: string, userId: string): Promise<boolean> {
    const storedData = await redisClient.getdel(`${this.prefix}${state}`);
    if (!storedData) return false;
    
    const { userId: storedUserId, timestamp } = JSON.parse(storedData);
    return storedUserId === userId && Date.now() - timestamp < STATE_TTL * 1000;
  }
}

export default StateManager;
