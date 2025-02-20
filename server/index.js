import express from 'express';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import CryptoJS from 'crypto-js';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const PROFILES_FILE = path.join(process.cwd(), 'data', 'profiles.json');
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

app.use(express.json());

// Encryption utilities
const encrypt = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
};

const decrypt = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

async function sendEmail(to, subject, text) {
  try {
    const info = await transporter.sendMail({
      from: `"Stream Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text
    });
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Profile storage management
async function loadProfiles() {
  try {
    const data = await fs.readFile(PROFILES_FILE, 'utf8');
    return decrypt(data);
  } catch (error) {
    return [];
  }
}

async function saveProfiles(profiles) {
  const encrypted = encrypt(profiles);
  await fs.writeFile(PROFILES_FILE, encrypted);
  
  if (profiles.length >= 900) {
    // Alert about migration need
    console.warn('Profile count exceeds 900. Consider migrating to cloud storage.');
    await sendEmail(
      process.env.ADMIN_EMAIL,
      'Storage Migration Alert',
      'Profile count exceeds 900. Please migrate to cloud storage.'
    );
  }
}

// API Routes
app.post('/invite-followers', async (req, res) => {
  const { accessToken } = req.body;
  try {
    const followers = await getFollowers(accessToken);
    const profiles = await loadProfiles();
    
    if (profiles.length + followers.length > 1000) {
      throw new Error('Maximum profile limit reached');
    }
    
    const updatedProfiles = [...profiles, ...followers];
    await saveProfiles(updatedProfiles);
    
    // Send notifications
    for (const follower of followers) {
      if (follower.email) {
        await sendEmail(
          follower.email,
          'Join us on our new platform!',
          'Your favorite creator has moved to a new platform. Click here to follow them!'
        );
      }
    }
    
    res.status(200).json({ message: 'Followers invited successfully' });
  } catch (error) {
    console.error('Error processing followers:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/notify', async (req, res) => {
  const { userId, message } = req.body;
  try {
    // Store notification in user's inbox
    // This would typically be handled by a database
    res.status(200).json({ message: 'Notification sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'An unexpected error occurred',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
