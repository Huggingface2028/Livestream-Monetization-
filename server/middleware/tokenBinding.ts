import * as crypto from 'crypto';

export const verifyTokenBinding = (req, res, next) => {
  const presentedToken = req.cookies.access_token;
  const storedTokenHash = req.session.token_hash;
  
  if (!presentedToken || !storedTokenHash) {
    return res.status(401).json({ error: 'Missing token binding' });
  }

  const currentHash = crypto
    .createHash('sha256')
    .update(presentedToken)
    .digest('hex');

  if (currentHash !== storedTokenHash) {
    return res.status(403).json({ error: 'Token binding mismatch' });
  }
  
  next();
};
