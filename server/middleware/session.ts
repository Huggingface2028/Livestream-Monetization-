import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { redisClient } from '../database/redis';
import { encryptSession, decryptSession } from '../security/sessionCrypto';
import { sessionReviver } from './sessionSecurity';
import { logger } from '../logger';

const sessionStore = new RedisStore({
  client: redisClient,
  prefix: 'sess:',
  ttl: 86400,
  disableTouch: false,
  enableAutoPipelining: true, // Enable Redis pipelining
  serializer: {
    parse: async (data) => {
      try {
        return JSON.parse(
          await decryptSession(data.toString()), 
          sessionReviver
        );
      } catch (error) {
        logger.error('Error parsing session data:', error);
        throw error;
      }
    },
    stringify: async (sess) => {
      try {
        return await encryptSession(JSON.stringify(sess, sessionReplacer)).then(result => result);
      } catch (error) {
        logger.error('Error stringifying session data:', error);
        throw error;
      }
    }
  }
});

const sessionConfig = {
  store: sessionStore,
  secret: process.env.SESSION_SECRET!,
  name: '__Host-session',
  resave: false,
  saveUninitialized: false,
  rolling: true, // Enable session prolongation on activity
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
} as session.SessionOptions;

export const sessionMiddleware = session(sessionConfig);

function sessionReplacer(key, value) {
  // Add custom session replacer logic here
  return value;
}
