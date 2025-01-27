import { encryptSession, decryptSession } from '../security/sessionCrypto';

export const storePKCEVerifier = async (req: Request, verifier: string) => {
  if (!req.session) throw new Error('Session middleware not initialized');
  
  // Encrypt before storing
  req.session.codeVerifier = await encryptSession(verifier);
  req.session.codeVerifierTimestamp = Date.now();
};

export const retrievePKCEVerifier = async (req: Request) => {
  const encryptedVerifier = req.session.codeVerifier;
  const timestamp = req.session.codeVerifierTimestamp;

  if (!encryptedVerifier || !timestamp) throw new Error('No PKCE verifier found');
  
  // Verify expiration first
  if (Date.now() - timestamp > 10 * 60 * 1000) {
    delete req.session.codeVerifier;
    delete req.session.codeVerifierTimestamp;
    throw new Error('PKCE verifier expired');
  }

  // Decrypt after retrieval
  return decryptSession(encryptedVerifier);
};