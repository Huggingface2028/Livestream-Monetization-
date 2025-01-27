const ALLOWED_REDIRECT_URIS = [
  'https://yourdomain.com/auth/callback',
  'http://localhost:3000/auth/callback'
];

export const validateRedirectUri = (uri: string): boolean => {
  try {
    const parsed = new URL(uri);
    const isValid = ALLOWED_REDIRECT_URIS.some(allowedUri => {
      const allowed = new URL(allowedUri);
      return parsed.protocol === allowed.protocol &&
             parsed.hostname === allowed.hostname &&
             parsed.port === allowed.port &&
             parsed.pathname === allowed.pathname;
    });
    
    return isValid && 
           !parsed.hash && // Prevent open redirects via fragment
           !parsed.username && // No embedded credentials
           !parsed.password;
  } catch {
    return false;
  }
};
