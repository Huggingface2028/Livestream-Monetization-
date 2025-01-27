import { YouTubeConfig } from '../types/auth'; // Define interface in your types

const YouTubeConfig: YouTubeConfig = {
  clientID: process.env.YOUTUBE_CLIENT_ID!,
  clientSecret: process.env.YOUTUBE_CLIENT_SECRET!,
  redirectURI: process.env.YOUTUBE_REDIRECT_URI!,
  authURL: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenURL: 'https://oauth2.googleapis.com/token',
  scopes: [
    'https://www.googleapis.com/auth/youtube.readonly',
    'profile',
    'email'
  ]
};

export default YouTubeConfig;