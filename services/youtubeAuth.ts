import axios from 'axios';

const CLIENT_KEY = import.meta.env.VITE_YOUTUBE_CLIENT_KEY;
const CLIENT_SECRET = import.meta.env.VITE_YOUTUBE_CLIENT_SECRET;
const REDIRECT_URI = import.meta.env.VITE_YOUTUBE_REDIRECT_URI;

export const initiateAuth = () => {
  const state = Math.random().toString(36).substring(7);
  localStorage.setItem('youtube_auth_state', state);

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth/authorize?client_id=${CLIENT_KEY}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=https://www.googleapis.com/auth/youtube.readonly&state=${state}`;
  window.location.href = authUrl;
};

export const getAccessToken = async (code: string) => {
  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: CLIENT_KEY,
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

export const getProfile = async (accessToken: string) => {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/channels?part=statistics&mine=true', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return response.data.items[0].statistics.subscriberCount;
  } catch (error) {
    console.error('Error retrieving subscriber count:', error);
    throw error;
  }
};
