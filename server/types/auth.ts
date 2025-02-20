export interface YouTubeConfig {
    clientID: string;
    clientSecret: string;
    redirectURI: string;
    authURL: string;
    tokenURL: string;
    scopes: string[];
  }
  
  export interface OAuthTokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  }
