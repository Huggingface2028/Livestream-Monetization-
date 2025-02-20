import axios from 'axios';
import { logger } from '../server/logger';

export async function getTikTokFollowers(accessToken: string) {
  try {
    const response = await axios.get('https://open.tiktokapis.com/v2/user/info/', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return response.data.followers;
  } catch (error) {
    logger.error('Error fetching TikTok followers:', error);
    throw new Error('Failed to fetch TikTok followers');
  }
}

export async function getYoutubeSubscribers(accessToken: string) {
    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/channels?part=statistics&mine=true', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      return response.data.items[0].statistics.subscriberCount;
    } catch (error) {
      logger.error('Error retrieving YouTube subscriber count:', error);
      throw error;
    }
  }

  export async function getTwitchEmail(accessToken: string) {
    try {
      const response = await axios.get('https://api.twitch.tv/helix/users', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Client-ID': import.meta.env.VITE_TWITCH_CLIENT_ID
        }
      });
      return response.data.data[0].email;
    } catch (error) {
      logger.error('Error retrieving Twitch user email:', error);
      throw error;
    }
  }

  export async function getSpotifyEmail(accessToken: string) {
    try {
      const response = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      return response.data.email;
    } catch (error) {
      logger.error('Error retrieving Spotify user email:', error);
      throw error;
    }
  }
