
export interface Session {
  id: string;
  date: string;
  sport_id: string;
  duration: number; // in minutes
  notes?: string;
  userId: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
}