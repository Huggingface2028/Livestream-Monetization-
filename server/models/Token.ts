interface TokenDocument {
  userId: string;
  accessTokenCipher: string;
  refreshTokenCipher: string;
  iv: string;
  authTag: string;
  createdAt: Date;
  updatedAt: Date;
}
