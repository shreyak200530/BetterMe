# BetterMe

A gamified habit tracker that transforms your daily routines into an epic adventure. Level up your character, earn experience points, and unlock cosmetic items as you build better habits.

## Features

### Gamification System
- **Character Progression**: Earn XP and level up your pixel art character
- **Visual Feedback**: Floating XP animations and smooth level-up celebrations
- **Character Customization**: Unlock and purchase cosmetic items from the shop
- **Dynamic Animations**: Idle, walking, and celebration animations for your character

### Habit Management
- **Flexible Tracking**: Create daily, weekly, or custom habits
- **Quick Actions**: Mark habits as complete with a single click
- **Habit Categories**: Organize habits for better management
- **Streak Tracking**: Monitor your consistency over time

### Analytics & Insights
- **Completion Rates**: Track your overall habit completion percentage
- **Current Streaks**: View active streaks for all habits
- **Total Stats**: See total habits completed and XP earned
- **Visual Dashboard**: Clean, modern interface with real-time updates

### User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Secure Authentication**: Email-based authentication with Supabase
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Smooth Animations**: Polished transitions and micro-interactions

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Supabase (Database, Auth, RLS)
- **Database**: PostgreSQL with Row Level Security

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables in `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── Auth.tsx              # Authentication component
│   ├── Dashboard.tsx         # Main dashboard view
│   ├── HabitCard.tsx         # Individual habit card
│   ├── HabitModal.tsx        # Habit creation/editing modal
│   ├── ExpBar.tsx            # Experience progress bar
│   ├── FloatingExp.tsx       # XP animation component
│   ├── LevelUpModal.tsx      # Level up celebration
│   ├── PixelCharacter.tsx    # Animated character sprite
│   ├── CharacterSheet.tsx    # Character stats display
│   ├── CharacterShop.tsx     # Cosmetic items shop
│   ├── AnalyticsDashboard.tsx # Statistics and insights
│   └── ErrorBoundary.tsx     # Error handling wrapper
├── contexts/
│   └── AuthContext.tsx       # Authentication state management
├── lib/
│   └── supabase.ts          # Supabase client configuration
├── App.tsx                   # Main application component
└── main.tsx                 # Application entry point
```

## Database Schema

### Users Table
Managed by Supabase Auth, contains user authentication data.

### Profiles Table
- `id`: User ID (references auth.users)
- `level`: Character level
- `total_exp`: Total experience points earned
- `coins`: In-game currency
- `equipped_items`: JSON array of equipped cosmetic items
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

### Habits Table
- `id`: Unique habit identifier
- `user_id`: Owner of the habit
- `title`: Habit name
- `description`: Optional habit description
- `frequency`: How often to complete (daily, weekly, custom)
- `exp_reward`: XP earned per completion
- `created_at`: Creation timestamp

### Habit Completions Table
- `id`: Unique completion identifier
- `habit_id`: Reference to completed habit
- `user_id`: User who completed the habit
- `completed_at`: Completion timestamp

### Shop Items Table
- `id`: Unique item identifier
- `name`: Item display name
- `type`: Item category (hat, accessory, etc.)
- `price`: Cost in coins
- `image_data`: Item appearance data
- `created_at`: Creation timestamp

### User Items Table
- `id`: Unique record identifier
- `user_id`: Item owner
- `item_id`: Reference to shop item
- `purchased_at`: Purchase timestamp

## Game Mechanics

### Experience System
- Base XP per habit completion: 50 XP
- XP required for next level: `100 * current_level`
- Example: Level 1→2 requires 100 XP, Level 2→3 requires 200 XP

### Coin System
- Earn 10 coins per level gained
- Used to purchase cosmetic items in the shop

### Level Progression
- Each level-up displays a celebration modal
- Character performs a celebration animation
- Coins are awarded automatically

## Security

All data is protected with Supabase Row Level Security (RLS):
- Users can only access their own profiles, habits, and completions
- Authentication required for all database operations
- Secure session management with automatic token refresh

## Future Enhancements

- Social features (friend challenges, leaderboards)
- More character customization options
- Achievement system with badges
- Habit templates and recommendations
- Data export and backup
- Mobile apps (iOS/Android)
- Habit reminders and notifications

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Check TypeScript types

### Contributing

Contributions are welcome! Please ensure:
- Code follows existing style and conventions
- TypeScript types are properly defined
- Components are properly tested
- RLS policies are maintained for security

## License

This project is open source and available for personal and commercial use.

