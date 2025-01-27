import crypto from 'crypto';
import base64url from 'base64url';

export const generatePKCEPair = () => {
  // Generate 32-byte cryptographically secure random string
  const codeVerifier = base64url(crypto.randomBytes(32));
  
  // Validate verifier meets RFC 7636 requirements
  if (!/^[A-Za-z0-9-._~]{43,128}$/.test(codeVerifier)) {
    throw new Error('Invalid code verifier generated');
  }

  // Create SHA-256 hash and base64url encode
  const codeChallenge = base64url(
    crypto.createHash('sha256')
      .update(codeVerifier)
      .digest()
  );

  return { codeVerifier, codeChallenge };
};

