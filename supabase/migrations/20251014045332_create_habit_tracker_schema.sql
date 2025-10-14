/*
  # Gamified Habit Tracker Database Schema

  ## Overview
  This migration creates the complete database structure for a gamified habit tracking application
  with RPG-like character progression, EXP system, and comprehensive habit management.

  ## New Tables

  ### 1. `profiles`
  User profile and character data:
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text) - User email
  - `character_level` (integer) - Current character level
  - `total_exp` (integer) - Total accumulated experience points
  - `current_exp` (integer) - EXP progress toward next level
  - `exp_to_next` (integer) - EXP required for next level
  - `coins` (integer) - Currency for character customization
  - `equipped_items` (jsonb) - Array of equipped item IDs
  - `unlocked_items` (jsonb) - Array of unlocked item IDs
  - `login_streak` (integer) - Consecutive daily login count
  - `last_login` (timestamptz) - Last login timestamp
  - `created_at` (timestamptz) - Account creation date

  ### 2. `habits`
  User habits with gamification parameters:
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - Links to profiles
  - `name` (text) - Habit name
  - `category` (text) - Category (health, learning, productivity, self-care, social)
  - `habit_type` (text) - Type (good or bad)
  - `exp_value` (integer) - Base EXP earned/lost
  - `difficulty` (text) - Difficulty multiplier (easy, medium, hard)
  - `streak` (integer) - Current streak count
  - `best_streak` (integer) - Personal best streak
  - `notes` (text) - Optional notes
  - `is_active` (boolean) - Whether habit is currently tracked
  - `created_at` (timestamptz) - Creation date

  ### 3. `habit_logs`
  Daily habit completion tracking:
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - Links to profiles
  - `habit_id` (uuid, foreign key) - Links to habits
  - `completed_at` (timestamptz) - Completion timestamp
  - `exp_earned` (integer) - EXP gained/lost
  - `streak_bonus` (integer) - Additional streak bonus EXP
  - `notes` (text) - Optional completion notes

  ### 4. `achievements`
  User achievements and milestones:
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - Links to profiles
  - `achievement_type` (text) - Achievement category
  - `achievement_name` (text) - Achievement name
  - `achievement_description` (text) - Description
  - `earned_at` (timestamptz) - Date earned
  - `badge_icon` (text) - Icon identifier

  ### 5. `character_items`
  Available character customization items:
  - `id` (text, primary key) - Item identifier
  - `name` (text) - Item name
  - `category` (text) - Item category (hat, shirt, accessory, effect, companion)
  - `required_level` (integer) - Level required to unlock
  - `coin_cost` (integer) - Cost in coins
  - `sprite_layer` (text) - Sprite layer identifier
  - `description` (text) - Item description

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Character items table is readable by all authenticated users
  - Policies enforce data isolation and security

  ## Important Notes
  1. EXP system uses progressive leveling: Level = floor(sqrt(total_exp / 100)) + 1
  2. Streak bonuses calculated as: floor(streak / 7) * 5 EXP
  3. Difficulty multipliers: easy (1x), medium (1.5x), hard (2x)
  4. Daily login bonuses tracked via last_login comparison
  5. All timestamps in UTC for consistency
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  character_level integer DEFAULT 1,
  total_exp integer DEFAULT 0,
  current_exp integer DEFAULT 0,
  exp_to_next integer DEFAULT 100,
  coins integer DEFAULT 0,
  equipped_items jsonb DEFAULT '[]'::jsonb,
  unlocked_items jsonb DEFAULT '[]'::jsonb,
  login_streak integer DEFAULT 0,
  last_login timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('health', 'learning', 'productivity', 'self-care', 'social')),
  habit_type text NOT NULL DEFAULT 'good' CHECK (habit_type IN ('good', 'bad')),
  exp_value integer NOT NULL DEFAULT 20,
  difficulty text NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  streak integer DEFAULT 0,
  best_streak integer DEFAULT 0,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create habit_logs table
CREATE TABLE IF NOT EXISTS habit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  habit_id uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  completed_at timestamptz DEFAULT now(),
  exp_earned integer NOT NULL,
  streak_bonus integer DEFAULT 0,
  notes text
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_type text NOT NULL,
  achievement_name text NOT NULL,
  achievement_description text,
  earned_at timestamptz DEFAULT now(),
  badge_icon text
);

-- Create character_items table
CREATE TABLE IF NOT EXISTS character_items (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('hat', 'shirt', 'accessory', 'effect', 'companion')),
  required_level integer DEFAULT 1,
  coin_cost integer DEFAULT 0,
  sprite_layer text,
  description text
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_items ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Habits policies
CREATE POLICY "Users can view own habits"
  ON habits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits"
  ON habits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits"
  ON habits FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits"
  ON habits FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Habit logs policies
CREATE POLICY "Users can view own habit logs"
  ON habit_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habit logs"
  ON habit_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habit logs"
  ON habit_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own habit logs"
  ON habit_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Achievements policies
CREATE POLICY "Users can view own achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Character items policies (readable by all authenticated users)
CREATE POLICY "All users can view character items"
  ON character_items FOR SELECT
  TO authenticated
  USING (true);

-- Insert starter character items
INSERT INTO character_items (id, name, category, required_level, coin_cost, sprite_layer, description)
VALUES
  ('hat_basic', 'Basic Cap', 'hat', 1, 0, 'hat_1', 'A simple starter cap'),
  ('hat_cool', 'Cool Beanie', 'hat', 6, 50, 'hat_2', 'A stylish beanie for level 6+'),
  ('hat_fancy', 'Fancy Fedora', 'hat', 11, 100, 'hat_3', 'An elegant fedora for true achievers'),
  ('shirt_basic', 'Basic Tee', 'shirt', 1, 0, 'shirt_1', 'Comfortable starter shirt'),
  ('shirt_hoodie', 'Cozy Hoodie', 'shirt', 11, 100, 'shirt_2', 'Perfect for productive days'),
  ('shirt_blazer', 'Sharp Blazer', 'shirt', 16, 150, 'shirt_3', 'For the professional habit master'),
  ('acc_glasses', 'Smart Glasses', 'accessory', 16, 80, 'acc_1', 'For the wise and focused'),
  ('acc_watch', 'Fitness Watch', 'accessory', 21, 120, 'acc_2', 'Track your progress in style'),
  ('effect_glow', 'Golden Aura', 'effect', 26, 200, 'effect_1', 'Radiate success and determination'),
  ('companion_cat', 'Pixel Cat', 'companion', 31, 300, 'companion_1', 'A loyal companion on your journey')
ON CONFLICT (id) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_active ON habits(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_id ON habit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_completed_at ON habit_logs(user_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);