import express from 'express';
import cors from 'cors';
import session from 'express-session';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
dotenv.config();
import { authRoutes } from './routes/auth';
import { OAuthRoutes } from './routes/OAuth';
import { healthRoutes } from './routes/health';
import { sessionConfig } from './config/session';
import { redisClient } from './database/redis';

const app = express();
const port = process.env.PORT || 3000;

// Middleware setup
app.use(cors({
  origin: process.env.VITE_CLIENT_URL,
  credentials: true,
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session(sessionConfig));

// Routes
app.use('/auth', authRoutes);
app.use('/oauth', OAuthRoutes);
app.use('/health', healthRoutes);

// YouTube Route
app.get('/youtube/profile', async (req, res) => {
  // TODO: Fetch YouTube profile data
  res.send('YouTube profile data');
});

// TikTok Route
app.get('/tiktok/profile', async (req, res) => {
  // TODO: Fetch TikTok profile data
  res.send('TikTok profile data');
});

// Twitch Route
app.get('/twitch/profile', async (req, res) => {
  // TODO: Fetch Twitch profile data
  res.send('Twitch profile data');
});

// Spotify Route
app.get('/spotify/profile', async (req, res) => {
  // TODO: Fetch Spotify profile data
  res.send('Spotify profile data');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
