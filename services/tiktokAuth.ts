import axios from 'axios';

const CLIENT_KEY = import.meta.env.VITE_TIKTOK_CLIENT_KEY;
const CLIENT_SECRET = import.meta.env.VITE_TIKTOK_CLIENT_SECRET;
const REDIRECT_URI = import.meta.env.VITE_TIKTOK_REDIRECT_URI;

export const initiateAuth = () => {
  const state = Math.random().toString(36).substring(7);
  localStorage.setItem('tiktok_auth_state', state);
  
  const authUrl = `https://www.tiktok.com/auth/authorize/?client_key=${CLIENT_KEY}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=user.info.basic,user.info.profile&state=${state}`;
  window.location.href = authUrl;
};

export const getAccessToken = async (code: string) => {
  try {
    const response = await axios.post('https://www.tiktok.com/auth/token/', {
      client_key: CLIENT_KEY,
      client_secret: CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
};

export const getFollowers = async (accessToken: string) => {
  try {
    const response = await axios.get('https://open.tiktokapis.com/v2/user/info/', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return response.data.followers;
  } catch (error) {
    console.error('Error retrieving followers:', error);
    throw error;
  }
};