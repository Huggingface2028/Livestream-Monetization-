import { authRequired } from '../middleware/auth';
import  revocationManager  from '../services/revocationService';

const express = require('express');
const axios = require('axios');
const qs = require('qs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const router = express.router();

const redirectUri = process.env.TIKTOK_REDIRECT_URI;

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Step 1: Redirect to TikTok Authorization
app.get('/auth/tiktok', (req, res) => {
  const authUrl = `https://www.tiktok.com/auth/authorize/?client_key=${process.env.TIKTOK_CLIENT_ID}&response_type=code&scope=user.info.basic,video.list&redirect_uri=${encodeURIComponent(redirectUri)}`;
  res.redirect(authUrl);
});

// Step 2: Handle TikTok Callback and Exchange Code for Token
app.get('/auth/tiktok/callback', async (req, res) => {
  const { code } = req.query;

  try {
    const tokenResponse = await axios.post(
      'https://open.tiktokapis.com/v2/oauth/token/',
      qs.stringify({
        client_key: process.env.TIKTOK_CLIENT_ID,
        client_secret: process.env.TIKTOK_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token, refresh_token, open_id } = tokenResponse.data.data;

    // Generate a JWT for secure session management
    const token = jwt.sign({ open_id, access_token }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Store tokens securely (e.g., in a database)
    res.cookie('auth_token', token, { httpOnly: true });
    res.json({ message: 'Successfully authenticated with TikTok!' });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to authenticate with TikTok' });
  }
});

const saveTokens = async (userId, accessToken, refreshToken) => {
  try {
    await Token.findOneAndUpdate(
      { userId },
      { accessToken, refreshToken },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Error saving tokens:', error);
    throw error;
  }
};

// PKCE Verification Middleware
const verifyPKCE = async (req, res, next) => {
  try {
    const { code_verifier: codeVerifier } = req.body;
    const storedVerifier = req.session.pkceVerifier;
    
    if (!codeVerifier || !storedVerifier) {
      return res.status(400).json({ error: 'Invalid PKCE parameters' });
    }

    const valid = await verifyPKCECode(storedVerifier, codeVerifier);
    if (!valid) {
      return res.status(403).json({ error: 'PKCE verification failed' });
    }
    
    delete req.session.pkceVerifier;
    next();
  } catch (error) {
    next(new AuthenticationError('PKCE verification failed'));
  }
};

// Modified Token Endpoint
router.post('/token', 
  verifyPKCE, // Add PKCE verification
  async (req, res) => {
    // to be added
  }
);

const Token = require('./models/Token');

app.get('/tiktok/videos', async (req, res) => {
  const { userId } = req.query;

  try {
    /* const tokenData = await Token.findOne({ userId }); */
    
        const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const tokenData = await Token.findOne({ userId: decoded.open_id });

    if (!tokenData) return res.status(404).json({ error: 'User tokens not found' });

    try {
      const videoResponse = await axios.get('https://open.tiktokapis.com/v2/video/list/', {
        headers: {
          Authorization: `Bearer ${tokenData.accessToken}`,
        },
      });

      res.json(videoResponse.data.data.videos);
    } catch (error) {
      if (error.response?.status === 401) {
        // Token expired, refresh it
        const refreshResponse = await axios.post(
          'https://open.tiktokapis.com/v2/oauth/token/',
          {
            client_key: process.env.TIKTOK_CLIENT_KEY,
            client_secret: process.env.TIKTOK_CLIENT_SECRET,
            refresh_token: tokenData.refreshToken,
            grant_type: 'refresh_token',
          },
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        
       if (error instanceof jwt.JsonWebTokenError) {
		return res.status(401).json({ error: 'Invalid token' });
		}

        const { access_token, refresh_token } = refreshResponse.data.data;
        await saveTokens(userId, access_token, refresh_token);

        // Retry video fetch with new token
        const retryResponse = await axios.get('https://open.tiktokapis.com/v2/video/list/', {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });

        res.json(retryResponse.data.data.videos);
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error fetching TikTok videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

router.post('/auth/revoke', 
  authRequired,
  async (req, res) => {
    await revocationManager.revokeToken(req.cookies.access_token, 3600);
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.sendStatus(204);
  }
);




app.listen(4000, () => console.log('Server running on http://localhost:4000'));
