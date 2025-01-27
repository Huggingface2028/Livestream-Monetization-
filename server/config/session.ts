import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { redisClient } from '../database/redis';
import { encryptSession, decryptSession } from '../security/sessionCrypto';
import { sessionReviver } from '../middleware/session';
// import MemoryStore from 'memorystore';

const sessionStore = new RedisStore({
  client: redisClient,
  prefix: 'sess:',
  ttl: 86400,
  disableTouch: false,
  enableAutoPipelining: true, // Enable Redis pipelining
  serializer: {
    parse: async (data) => JSON.parse(
      await decryptSession(data.toString()), 
      sessionReviver
    ),
    stringify: async (sess) => 
      await encryptSession(JSON.stringify(sess, sessionReplacer)).then(result => result)
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


export default sessionConfig;