import { Profile } from '../models/Profile';

export async function loadProfile(userId: string): Promise<Profile | null> {
  // TODO: Load profile from database or storage
  console.log(`Loading profile for user: ${userId}`);
  return null;
}

export async function saveProfile(profile: Profile): Promise<void> {
  // TODO: Save profile to database or storage
  console.log(`Saving profile for user: ${profile.userId}`);
}
