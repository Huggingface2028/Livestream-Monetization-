export interface Profile {
  userId: string;
  youtube?: {
    subscriberCount: number;
  };
  tiktok?: {
    followers: number;
  };
  twitch?: {
    email: string;
  };
  spotify?: {
    email: string;
  };
}
