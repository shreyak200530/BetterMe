import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export interface Profile {
  id: string;
  email: string;
  character_level: number;
  total_exp: number;
  current_exp: number;
  exp_to_next: number;
  coins: number;
  equipped_items: string[];
  unlocked_items: string[];
  login_streak: number;
  last_login: string;
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  category: 'health' | 'learning' | 'productivity' | 'self-care' | 'social';
  habit_type: 'good' | 'bad';
  exp_value: number;
  difficulty: 'easy' | 'medium' | 'hard';
  streak: number;
  best_streak: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
}

export interface HabitLog {
  id: string;
  user_id: string;
  habit_id: string;
  completed_at: string;
  exp_earned: number;
  streak_bonus: number;
  notes?: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_name: string;
  achievement_description?: string;
  earned_at: string;
  badge_icon?: string;
}

export interface CharacterItem {
  id: string;
  name: string;
  category: 'hat' | 'shirt' | 'accessory' | 'effect' | 'companion';
  required_level: number;
  coin_cost: number;
  sprite_layer?: string;
  description?: string;
}
