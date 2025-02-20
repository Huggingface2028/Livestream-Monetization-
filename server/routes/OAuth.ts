import express from 'express';
import { Request, Response } from 'express';
import { getAccessToken as getYoutubeAccessToken, getProfile as getYoutubeProfile } from '../../services/youtubeAuth';
import { getAccessToken as getTikTokAccessToken, getFollowers as getTikTokFollowers } from '../../services/tiktokAuth';
import { getAccessToken as getTwitchAccessToken, getProfile as getTwitchProfile } from '../../services/twitchAuth';
import { getAccessToken as getSpotifyAccessToken, getProfile as getSpotifyProfile } from '../../services/spotifyAuth';
import { loadProfile, saveProfile } from '../services/profileService';
import { Profile } from '../models/Profile';

export const OAuthRoutes = express.Router();

OAuthRoutes.get('/youtube/callback', async (req: Request, res: Response) => {
  const { code, state } = req.query;

  if (typeof code === 'string') {
    try {
      const accessToken = await getYoutubeAccessToken(code);
      const subscriberCount = await getYoutubeProfile(accessToken);

      // Load existing profile or create a new one
      let profile: Profile | null = await loadProfile(req.session.userId);
      if (!profile) {
        profile = { userId: req.session.userId };
      }

      // Update YouTube data
      profile.youtube = { subscriberCount: subscriberCount };
      await saveProfile(profile);

      console.log('YouTube Subscriber Count:', subscriberCount);
      res.redirect(`${process.env.VITE_CLIENT_URL}/rewards`);
    } catch (error) {
      console.error('Error during YouTube OAuth callback:', error);
      res.status(500).send('YouTube OAuth failed');
    }
  } else {
    res.status(400).send('Invalid code');
  }
});

OAuthRoutes.get('/tiktok/callback', async (req: Request, res: Response) => {
  const { code, state } = req.query;

  if (typeof code === 'string') {
    try {
      const accessToken = await getTikTokAccessToken(code);
      const followers = await getTikTokFollowers(accessToken);

      // Load existing profile or create a new one
      let profile: Profile | null = await loadProfile(req.session.userId);
      if (!profile) {
        profile = { userId: req.session.userId };
      }

      // Update TikTok data
      profile.tiktok = { followers: followers };
      await saveProfile(profile);

      console.log('TikTok Followers:', followers);
      res.redirect(`${process.env.VITE_CLIENT_URL}/rewards`);
    } catch (error) {
      console.error('Error during TikTok OAuth callback:', error);
      res.status(500).send('TikTok OAuth failed');
    }
  } else {
    res.status(400).send('Invalid code');
  }
});

OAuthRoutes.get('/twitch/callback', async (req: Request, res: Response) => {
    const { code, state } = req.query;

    if (typeof code === 'string') {
      try {
        const accessToken = await getTwitchAccessToken(code);
        const email = await getTwitchProfile(accessToken);

        // Load existing profile or create a new one
        let profile: Profile | null = await loadProfile(req.session.userId);
        if (!profile) {
          profile = { userId: req.session.userId };
        }

        // Update Twitch data
        profile.twitch = { email: email };
        await saveProfile(profile);

        console.log('Twitch Email:', email);
        res.redirect(`${process.env.VITE_CLIENT_URL}/rewards`);
      } catch (error) {
        console.error('Error during Twitch OAuth callback:', error);
        res.status(500).send('Twitch OAuth failed');
      }
    } else {
      res.status(400).send('Invalid code');
    }
  });

  OAuthRoutes.get('/spotify/callback', async (req: Request, res: Response) => {
    const { code, state } = req.query;

    if (typeof code === 'string') {
      try {
        const accessToken = await getSpotifyAccessToken(code);
        const email = await getSpotifyProfile(accessToken);

        // Load existing profile or create a new one
        let profile: Profile | null = await loadProfile(req.session.userId);
        if (!profile) {
          profile = { userId: req.session.userId };
        }

        // Update Spotify data
        profile.spotify = { email: email };
        await saveProfile(profile);

        console.log('Spotify Email:', email);
        res.redirect(`${process.env.VITE_CLIENT_URL}/rewards`);
      } catch (error) {
        console.error('Error during Spotify OAuth callback:', error);
        res.status(500).send('Spotify OAuth failed');
      }
    } else {
      res.status(400).send('Invalid code');
    }
  });
