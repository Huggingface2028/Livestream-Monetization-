import crypto from 'crypto';
import { redisClient } from '../database/redis';

const STATE_TTL = 300; // 5 minutes

export const generateAntiForgeryToken = async (userId: string) => {
  const state = crypto.randomBytes(32).toString('hex');
  const hmac = crypto.createHmac('sha256', process.env.STATE_SECRET!);
  hmac.update(`${userId}|${state}|${Date.now()}`);
  const signature = hmac.digest('hex');
  
  const token = `${state}:${signature}`;
  
  await redisClient.setex(`state:${token}`, STATE_TTL, `${userId}|${Date.now()}`);
  return token;
};

export const validateAntiForgeryToken = async (token: string, userId: string) => {
  // Basic format check
  const [state, signature] = token.split(':');
  if (!state || !signature) return false;
  
  // HMAC validation
  const storedData = await redisClient.get(`state:${token}`);
  if (!storedData) return false;
  const [storedUserId, storedTimestamp] = storedData.split('|');
  
  const hmac = crypto.createHmac('sha256', process.env.STATE_SECRET!);
  hmac.update(`${userId}|${state}|${storedTimestamp}`);
  const expectedSignature = hmac.digest('hex');
  
  // Constant-time comparison
  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
  
  await redisClient.del(`state:${token}`);
  
  return isValid;
};
