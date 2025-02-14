import { Session, User } from './types';

export const users: User[] = [
  {
    id: '1',
    name: 'John Doe',
    avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop',
  },
  {
    id: '2',
    name: 'Jane Smith',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  },
];

export const sessions: Session[] = [
  {
    id: '1',
    date: '2024-03-15',
    sport: 'running',
    duration: 45,
    notes: '5k run',
    userId: '1',
  },
  {
    id: '2',
    date: '2024-03-15',
    sport: 'swimming',
    duration: 60,
    notes: 'Pool training',
    userId: '2',
  },
  // Add more sample sessions as needed
];