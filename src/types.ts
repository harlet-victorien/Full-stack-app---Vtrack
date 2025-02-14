export type Sport = 'running' | 'cycling' | 'swimming' | 'gym' | 'tennis' | 'basketball';

export interface Session {
  id: string;
  date: string;
  sport: Sport;
  duration: number; // in minutes
  notes?: string;
  userId: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
}