import axios from 'axios';
import  pkceChallenge  from 'pkce-challenge';
import * as crypto from 'crypto'

const CLIENT_KEY = import.meta.env.VITE_TIKTOK_CLIENT_KEY;
const CLIENT_SECRET = import.meta.env.VITE_TIKTOK_CLIENT_SECRET;
const REDIRECT_URI = import.meta.env.VITE_TIKTOK_REDIRECT_URI;


/**
 * Initiates TikTok OAuth Authorization
 */
export const initiateAuth = async () => {
//
  const { code_verifier, code_challenge } = await pkceChallenge();
  const state = crypto.randomBytes(32).toString('hex');
 
  // Secure storage using sessionStorage
  sessionStorage.setItem('pkce_verifier', code_verifier);
  sessionStorage.setItem('oauth_state', state);

  const authUrl = `https://www.tiktok.com/auth/authorize/?client_key=${CLIENT_KEY}&response_type=code&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=user.info.basic,video.list&state=${state}&code_challenge=${code_challenge}&code_challenge_method=S256`;

  window.location.href = authUrl;
};

/**
 * Exchanges authorization code for an access token.
 * @param {string} code - Authorization code from TikTok OAuth.
 * @returns {Promise<{ access_token: string; refresh_token: string }>}
 */
export const getAccessToken = async (code: string): Promise<{ access_token: string; refresh_token: string }> => {
  try {
    const response = await axios.post(
      'https://open.tiktokapis.com/v2/oauth/token/',
      {
        client_key: CLIENT_KEY,
        client_secret: CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      },
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token, refresh_token } = response.data.data;
    return { access_token, refresh_token };
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
};

/**
 * Fetches TikTok user details, including follower count.
 * @param {string} accessToken - TikTok access token.
 * @returns {Promise<{ followers: number; nickname: string }>}
 */
export const getUserInfo = async (accessToken: string): Promise<{ followers: number; nickname: string }> => {
  try {
    const response = await axios.get('https://open.tiktokapis.com/v2/user/info/', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const { followers, nickname } = response.data.data;
    return { followers, nickname };
  } catch (error) {
    console.error('Error retrieving user info:', error);
    throw error;
  }
};

/**
 * Fetches TikTok user's video list.
 * @param {string} accessToken - TikTok access token.
 * @returns {Promise<Array<{ id: string; title: string; cover: string; playCount: number }>>}
 */
export const getUserVideos = async (
  accessToken: string
): Promise<Array<{ id: string; title: string; cover: string; playCount: number }>> => {
  try {
    const response = await axios.get('https://open.tiktokapis.com/v2/video/list/', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const videos = response.data.data.videos.map((video: any) => ({
      id: video.id,
      title: video.title || 'Untitled',
      cover: video.cover_image_url,
      playCount: video.statistics?.play_count || 0,
    }));

    return videos;
  } catch (error) {
    console.error('Error retrieving user videos:', error);
    throw error;
  }
};

// Add token validation
export const validateToken = async (accessToken: string): Promise<boolean> => {
  try {
    await axios.get('https://open.tiktokapis.com/v2/user/info/', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return true;
  } catch (error) {
    return false;
  }
};

// Add token refresh functionality
export const refreshToken = async (
  refreshToken: string
): Promise<{ access_token: string; refresh_token: string }> => {
  try {
    const response = await axios.post(
      'https://open.tiktokapis.com/v2/oauth/token/',
      {
        client_key: CLIENT_KEY,
        client_secret: CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      },
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    
    return response.data.data;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw error;
  }
};
