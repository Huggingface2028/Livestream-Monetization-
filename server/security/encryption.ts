import { webcrypto } from 'crypto';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function deriveKey(password: string) {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
}

export async function encrypt(data: any) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const keyMaterial = await deriveKey(process.env.ENCRYPTION_KEY!);
  
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

export async function decrypt(encryptedData: string) {
  const { iv, data } = JSON.parse(encryptedData);
  const keyMaterial = await deriveKey(process.env.ENCRYPTION_KEY!);
  
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
