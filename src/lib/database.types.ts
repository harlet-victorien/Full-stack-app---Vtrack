export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          date: string
          sport: 'running' | 'cycling' | 'swimming' | 'gym' | 'tennis' | 'basketball'
          duration: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          sport: 'running' | 'cycling' | 'swimming' | 'gym' | 'tennis' | 'basketball'
          duration: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          sport?: 'running' | 'cycling' | 'swimming' | 'gym' | 'tennis' | 'basketball'
          duration?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}