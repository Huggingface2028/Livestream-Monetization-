import { webcrypto } from 'crypto';
import { redisClient } from '../database/redis';

const algorithm = { 
  name: 'AES-GCM',
  length: 256
};

const deriveKey = async (secret: string) => {
  const encoder = new TextEncoder();
  const keyMaterial = await webcrypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return webcrypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(process.env.SESSION_SALT!),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    algorithm,
    true,
    ['encrypt', 'decrypt']
  );
};

export const encryptSession = async (session: string) => {
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(process.env.SESSION_SECRET!);
  const compressed = await compress(Buffer.from(session));
  
  const ciphertext = await webcrypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(session)
  );

  return JSON.stringify({
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(ciphertext))
  });
};

export const decryptSession = async (ciphertext: string) => {
  const { iv, data } = JSON.parse(ciphertext);
  const key = await deriveKey(process.env.SESSION_SECRET!);
  
  const decrypted = await webcrypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(iv) },
    key,
    new Uint8Array(data)
  );

  return await decompress(decryptedBuffer);
};
