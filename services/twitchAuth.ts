import axios from 'axios';

const CLIENT_ID = import.meta.env.VITE_TWITCH_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_TWITCH_CLIENT_SECRET;
const REDIRECT_URI = import.meta.env.VITE_TWITCH_REDIRECT_URI;

export const initiateAuth = () => {
  const state = Math.random().toString(36).substring(7);
  localStorage.setItem('twitch_auth_state', state);

  const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=user:read:email&state=${state}`;
  window.location.href = authUrl;
};

export const getAccessToken = async (code: string) => {
  try {
    const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
};

export const getProfile = async (accessToken: string) => {
  try {
    const response = await axios.get('https://api.twitch.tv/helix/users', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Client-ID': CLIENT_ID
      }
    });
    return response.data.data[0].email;
  } catch (error) {
    console.error('Error retrieving user email:', error);
    throw error;
  }
};
