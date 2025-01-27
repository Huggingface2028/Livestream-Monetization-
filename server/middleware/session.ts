import session from 'express-session';
import MemoryStore from 'memorystore'; // Ensure proper import
import { redisClient } from '../database/redis';
import { encryptSession, decryptSession } from '../security/sessionCrypto';
import { RedisStore } from 'connect-redis';
import { Response as ExpressResponse } from 'express';
import sessionConfig from '../config/session';


// Updated session store configuration
const sessionStore = process.env.NODE_ENV === 'production' 
  ? new RedisStore({
      client: redisClient,
      prefix: 'sess:',
      ttl: 86400
    })
  : MemoryStore({
      checkPeriod: 86400000, // Development only
    /* // @ts-expect-error MemoryStore type compatibility issues */
      dispose: (key, value) => encryptSession(value)
    });

// Update sessionReplacer/Reviver for encryption
function sessionReplacer(key: string, value: any) {
  if (key === 'codeVerifier') return undefined;
  if (value instanceof Buffer) return value.toString('base64');
  return value;
}

export function sessionReviver(key: string, value: any) {
  if (key === 'timestamp') return new Date(value);
  return value;
}

const fallbackStore = process.env.NODE_ENV === 'production' 
  ? sessionStore 
  : MemoryStore({
      checkPeriod: 86400000 // Prune expired entries daily
    });

    export const setAuthCookies = (res: ExpressResponse, tokens: { accessToken: string, refreshToken: string }) => {
      res.cookie('access_token', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 900000, // 15 minutes
        path: '/'
      });
    
      res.cookie('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 604800000, // 7 days
        path: '/auth/refresh'
      });
    };


export const sessionMiddleware = session(sessionConfig);
