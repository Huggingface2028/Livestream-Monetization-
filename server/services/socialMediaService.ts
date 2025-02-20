import axios from 'axios';
import { logger } from '../logger';

export async function getFollowers(accessToken: string) {
  try {
    // Replace with actual TikTok API endpoint
    const response = await axios.get('https://api.tiktok.com/v2/user/follower/list', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return response.data;
  } catch (error) {
    logger.error('Error fetching followers:', error);
    throw new Error('Failed to fetch followers');
  }
}
