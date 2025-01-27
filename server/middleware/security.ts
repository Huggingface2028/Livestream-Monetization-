import helmet from 'helmet';
import express from 'express';
import * as crypto from 'crypto'

const app = express();

const generateNonce = () => crypto.randomBytes(16).toString('base64');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'", 
        (req, res) => `'nonce-${generateNonce()}'`, // Add nonce
        "trusted-cdn.com"
      ],
      styleSrc: ["'self'", "trusted-cdn.com"], // Remove unsafe-inline
      imgSrc: ["'self'", "data:", "cdn.example.com"],
      connectSrc: ["'self'", "api.tiktok.com"]
    }
  },
  hsts: { maxAge: 63072000, includeSubDomains: true, preload: true }
}));

app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});