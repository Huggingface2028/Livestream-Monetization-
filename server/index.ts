import express from 'express';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import { enqueueEmails } from './config/emailQueue';
// import { createWorker } from './emailWorker';
import { webcrypto } from 'crypto';
import { sendEmail } from './services/emailService';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const PROFILES_FILE = path.join(process.cwd(), 'data', 'profiles.json');
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

app.use(express.json());

// Encryption utilities
const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function deriveKey(password) {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
}

async function encrypt(data) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const keyMaterial = await deriveKey(process.env.ENCRYPTION_KEY);
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: iv,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(JSON.stringify(data))
  );

  return JSON.stringify({
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(encrypted)),
  });
}

async function decrypt(encryptedData) {
  const { iv, data } = JSON.parse(encryptedData);
  const keyMaterial = await deriveKey(process.env.ENCRYPTION_KEY);
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new Uint8Array(iv),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['decrypt']
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(iv) },
    key,
    new Uint8Array(data)
  );

  return JSON.parse(decoder.decode(decrypted));
}


// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const { subtle } = webcrypto;

async function deriveHKDFKey(masterKey) {
  return subtle.deriveKey(
    {
      name: 'HKDF',
      salt: new TextEncoder().encode(process.env.HKDF_SALT),
      info: new TextEncoder().encode('auth-encryption'),
      hash: 'SHA-512',
    },
    masterKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// await enqueueEmails(followers.filter(f => f.email).map(f => f.email));
// createWorker();

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
  const encrypted = await encrypt(profiles);
  await fs.writeFile(PROFILES_FILE, encrypted);
  
  if (profiles.length >= 900) {
    // Alert about migration need
    console.warn('Profile count exceeds 900. Consider migrating to cloud storage.');
  if (process.env.ADMIN_EMAIL) {
    await sendEmail(
      process.env.ADMIN_EMAIL,
      'Storage Migration Alert',
      'Profile count exceeds 900. Please migrate to cloud storage.'
    );
  } else {
    console.error('No admin email set. Cannot send migration alert.');
  }
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
	const emailJobs = followers.filter(f => f.email).map(follower => ({
	  to: follower.email,
	  subject: 'Join us on our new platform!',
	  text: 'Your favorite creator has moved to a new platform. Click here to follow them!'
	}));
	
	await enqueueEmails(emailJobs);
    
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
