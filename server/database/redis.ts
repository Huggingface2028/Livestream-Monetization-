import Redis from 'ioredis';
import { createSecureContext } from 'tls';
import { logger } from '../logger';

const redisConfig = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  tls: process.env.NODE_ENV === 'production' ? {
    secureContext: createSecureContext({
      minVersion: 'TLSv1.3',
      ciphers: 'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256'
    }),
    checkServerIdentity: (hostname: string, cert: any) => {
      if (cert.subject.CN !== process.env.REDIS_CERT_CN) {
        return new Error('Redis certificate CN mismatch');
      }
      return undefined;
    }
  } : undefined,
  // Enhanced settings
  enableAutoPipelining: true,
  poolSize: 10,
  maxRetriesPerRequest: 2,
  connectTimeout: 2000,
  commandTimeout: 1500,
  retryStrategy: (times: number) => Math.min(times * 100, 3000),
  enableOfflineQueue: false,
  autoResendUnfulfilledCommands: false
};

export const redisClient = new Redis(redisConfig);

// Maintain existing event listeners
redisClient
  .on('connect', () => logger.info('Redis connecting...'))
  .on('ready', () => logger.info('Redis ready'))
  .on('error', (err) => logger.error('Redis error:', err))
  .on('close', () => logger.warn('Redis connection closed'))
  .on('reconnecting', (ms) => logger.info(`Redis reconnecting in ${ms}ms`))
  .on('end', () => logger.error('Redis connection ended'));
