import { validateAntiForgeryToken } from './../auth/state';
import  { authStateValidationCounter } from  '../monitoring/metrics';
import { generatePKCEPair } from '../auth/pkce';
import { storePKCEVerifier } from '../middleware/pkceSession';
import { verifyToken } from '../middleware/auth';
import { setAuthCookies } from '../middleware/session';
const express = require('express');
const router = express.Router();
const axios = require('axios');
const YouTubeConfig = require('../config/youtube');

// Initiate YouTube OAuth flow
router.get('/auth/youtube', (req, res) => {
  const authURL = new URL(YouTubeConfig.authURL);
  authURL.searchParams.set('client_id', YouTubeConfig.clientID);
  authURL.searchParams.set('redirect_uri', YouTubeConfig.redirectURI);
  authURL.searchParams.set('response_type', 'code');
  authURL.searchParams.set('scope', YouTubeConfig.scopes.join(' '));
  authURL.searchParams.set('access_type', 'offline');
  
  res.redirect(authURL.toString());
});

// Handle YouTube callback
router.get('/auth/youtube/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    // Exchange code for tokens
    const { data } = await axios.post(YouTubeConfig.tokenURL, {
      client_id: YouTubeConfig.clientID,
      client_secret: YouTubeConfig.clientSecret,
      code,
      redirect_uri: YouTubeConfig.redirectURI,
      grant_type: 'authorization_code'
    });

    // Store tokens in session (you'll want to store in DB properly later)
    req.session.youtubeTokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token
    };

    res.redirect('http://localhost:3000/dashboard');
  } catch (error) {
    console.error('YouTube Auth Error:', error.response.data);
    res.redirect('http://localhost:3000/error');
  }
});


// Initiate TikTok OAuth flow

router.get('/auth/tiktok', (req, res) => {
  const { codeVerifier, codeChallenge } = generatePKCEPair();
  
  // Store verifier in server-side session
  storePKCEVerifier(req, codeVerifier);

  const authUrl = new URL('https://www.tiktok.com/auth/authorize/');
  authUrl.searchParams.append('client_key', process.env.TIKTOK_CLIENT_ID!);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('scope', 'user.info.basic,video.list');
  authUrl.searchParams.append('redirect_uri', process.env.TIKTOK_REDIRECT_URI!);
  authUrl.searchParams.append('code_challenge', codeChallenge);
  authUrl.searchParams.append('code_challenge_method', 'S256');
  
  res.redirect(authUrl.toString());
});

router.get('/auth/tiktok/callback', async (req, res) => {
  const { code, state } = req.query;
  const userId = req.session.userId!;

  try {
    if (!await validateAntiForgeryToken(state as string, userId)) {
      authStateValidationCounter.inc({ result: 'invalid' });
      throw new SecurityError('Invalid state parameter');
    }
    
    authStateValidationCounter.inc({ result: 'valid' });
    // Continue with OAuth flow...
  } catch (error) {
    errorHandler(error, req, res);
  }
});

router.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken) return res.sendStatus(401);

  try {
    const decoded = verifyToken(refreshToken);
    const tokenService = new TokenService();
    const newAccessToken = await tokenService.refreshToken(decoded.userId, refreshToken);
    
    setAuthCookies(res, {
      accessToken: newAccessToken,
      refreshToken // Only send new refresh token if required
    });
    
    res.sendStatus(204);
  } catch (error) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.status(401).json({ error: 'Session expired - please reauthenticate' });
  }
});

module.exports = router;