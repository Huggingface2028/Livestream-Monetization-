import { KMSClient, GenerateDataKeyCommand, DecryptCommand } from '@aws-sdk/client-kms';

const kms = new KMSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export class TokenVault {
  private keyId = process.env.KMS_KEY_ID!;
  private currentKeyVersion: number;

  async encryptToken(token: string) {
    const { CiphertextBlob, Plaintext } = await kms.send(
      new GenerateDataKeyCommand({
        KeyId: this.keyId,
        KeySpec: 'AES_256',
      })
    );
    
      async initialize() {
    const keyMetadata = await kms.describeKey({ KeyId: this.keyId });
    this.currentKeyVersion = keyMetadata.KeyMetadata.KeyVersion;
  }

  async rotateKeys() {
    const newKey = await kms.createKey({ 
      Policy: '...', // Define IAM policy
      KeyUsage: 'ENCRYPT_DECRYPT',
      Origin: 'AWS_KMS'
    });
    this.currentKeyVersion = newKey.KeyMetadata.KeyVersion;
  }

    const cipher = crypto.createCipheriv('aes-256-gcm', Plaintext);
    const encrypted = Buffer.concat([
      cipher.update(token, 'utf8'),
      cipher.final(),
    ]);

    return {
      ciphertext: encrypted.toString('base64'),
      key: CiphertextBlob.toString('base64'),
      iv: cipher.getIV().toString('base64'),
      tag: cipher.getAuthTag().toString('base64'),
    };
  }

  async decryptToken(encryptedData: string) {
    const { key, iv, tag, ciphertext } = JSON.parse(encryptedData);
    
    const { Plaintext } = await kms.send(
      new DecryptCommand({
        CiphertextBlob: Buffer.from(key, 'base64'),
      })
    );

    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Plaintext,
      Buffer.from(iv, 'base64')
    );
    decipher.setAuthTag(Buffer.from(tag, 'base64'));

    return Buffer.concat([
      decipher.update(Buffer.from(ciphertext, 'base64')),
      decipher.final(),
    ]).toString('utf8');
  }
}

const vault = new TokenVault();
await vault.initialize();
