import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Habit, HabitLog } from '../lib/supabase';
import { Plus, LogOut, TrendingUp, Award, Settings, Scroll } from 'lucide-react';
import PixelCharacter from './PixelCharacter';
import ExpBar from './ExpBar';
import HabitCard from './HabitCard';
import HabitModal from './HabitModal';
import FloatingExp from './FloatingExp';
import LevelUpModal from './LevelUpModal';
import CharacterSheet from './CharacterSheet';
import AnalyticsDashboard from './AnalyticsDashboard';
import CharacterShop from './CharacterShop';

type View = 'quests' | 'character' | 'analytics' | 'shop';

export default function Dashboard() {
  const { profile, signOut, refreshProfile } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayLogs, setTodayLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>();
  const [floatingExps, setFloatingExps] = useState<Array<{ id: string; amount: number; x: number; y: number }>>([]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(0);
  const [characterMood, setCharacterMood] = useState<'idle' | 'happy' | 'sad'>('idle');
  const [currentView, setCurrentView] = useState<View>('quests');

  useEffect(() => {
    if (profile) {
      loadHabits();
      loadTodayLogs();
    }
  }, [profile]);

  const loadHabits = async () => {
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHabits(data || []);
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTodayLogs = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('habit_logs')
        .select('*')
        .gte('completed_at', today)
        .lt('completed_at', new Date(Date.now() + 86400000).toISOString());

      if (error) throw error;
      setTodayLogs(data || []);
    } catch (error) {
      console.error('Error loading today logs:', error);
    }
  };

  const calculateLevel = (totalExp: number) => {
    return Math.floor(Math.sqrt(totalExp / 100)) + 1;
  };

  const calculateExpForNextLevel = (level: number) => {
    return (level * level - 1) * 100;
  };

  const handleCompleteHabit = async (habit: Habit) => {
    if (!profile) return;

    try {
      const difficultyMultiplier = habit.difficulty === 'easy' ? 1 : habit.difficulty === 'medium' ? 1.5 : 2;
      const baseExp = Math.round(habit.exp_value * difficultyMultiplier);
      const streakBonus = Math.floor(habit.streak / 7) * 5;
      const totalExp = habit.habit_type === 'good' ? baseExp + streakBonus : -(baseExp);

      const button = document.querySelector(`button[data-habit-id="${habit.id}"]`) as HTMLElement;
      const rect = button?.getBoundingClientRect() || { left: window.innerWidth / 2, top: window.innerHeight / 2 };

      setFloatingExps((prev) => [
        ...prev,
        { id: Date.now().toString(), amount: totalExp, x: rect.left, y: rect.top },
      ]);

      if (totalExp > 0) {
        setCharacterMood('happy');
      } else {
        setCharacterMood('sad');
      }

      setTimeout(() => setCharacterMood('idle'), 2000);

      const { error: logError } = await supabase.from('habit_logs').insert({
        user_id: profile.id,
        habit_id: habit.id,
        exp_earned: baseExp,
        streak_bonus: streakBonus,
      });

      if (logError) throw logError;

      const newTotalExp = profile.total_exp + totalExp;
      const newLevel = calculateLevel(newTotalExp);
      const oldLevel = profile.character_level;
      const expForNextLevel = calculateExpForNextLevel(newLevel + 1);
      const currentExp = newTotalExp - calculateExpForNextLevel(newLevel);
      const expToNext = expForNextLevel - calculateExpForNextLevel(newLevel);

      const newStreak = habit.habit_type === 'good' ? habit.streak + 1 : Math.max(0, habit.streak - 1);
      const newCoins = profile.coins + (habit.habit_type === 'good' ? 5 : 0);

      const { error: habitError } = await supabase
        .from('habits')
        .update({
          streak: newStreak,
          best_streak: Math.max(newStreak, habit.best_streak),
        })
        .eq('id', habit.id);

      if (habitError) throw habitError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          total_exp: newTotalExp,
          current_exp: currentExp,
          exp_to_next: expToNext,
          character_level: newLevel,
          coins: newCoins,
        })
        .eq('id', profile.id);

      if (profileError) throw profileError;

      if (newLevel > oldLevel) {
        setNewLevel(newLevel);
        setShowLevelUp(true);

        if (newLevel % 5 === 1) {
          await checkAndUnlockItems(newLevel);
        }
      }

      await refreshProfile();
      await loadHabits();
      await loadTodayLogs();
    } catch (error) {
      console.error('Error completing habit:', error);
    }
  };

  const checkAndUnlockItems = async (level: number) => {
    if (!profile) return;

    try {
      const { data: items } = await supabase
        .from('character_items')
        .select('*')
        .eq('required_level', level)
        .eq('coin_cost', 0);

      if (items && items.length > 0) {
        const newUnlocked = [...profile.unlocked_items, ...items.map((item) => item.id)];
        await supabase
          .from('profiles')
          .update({ unlocked_items: newUnlocked })
          .eq('id', profile.id);

        await refreshProfile();
      }
    } catch (error) {
      console.error('Error unlocking items:', error);
    }
  };

  const handleSaveHabit = async (habitData: Partial<Habit>) => {
    if (!profile) return;

    try {
      if (editingHabit) {
        const { error } = await supabase
          .from('habits')
          .update(habitData)
          .eq('id', editingHabit.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('habits').insert({
          ...habitData,
          user_id: profile.id,
        });

        if (error) throw error;
      }

      await loadHabits();
      setShowHabitModal(false);
      setEditingHabit(undefined);
    } catch (error) {
      console.error('Error saving habit:', error);
      throw error;
    }
  };

  const handleDeleteHabit = async (habit: Habit) => {
    if (!confirm('Are you sure you want to delete this habit?')) return;

    try {
      const { error } = await supabase
        .from('habits')
        .update({ is_active: false })
        .eq('id', habit.id);

      if (error) throw error;
      await loadHabits();
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  const removeFloatingExp = (id: string) => {
    setFloatingExps((prev) => prev.filter((exp) => exp.id !== id));
  };

  if (!profile) return null;

  const activeHabits = habits.filter((h) => h.is_active);
  const completedToday = todayLogs.map((log) => log.habit_id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="bg-slate-800/50 backdrop-blur-sm border-b-2 border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">BetterMe</h1>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-xl border-2 border-slate-700 p-6 sticky top-24">
              <div className="text-center mb-6">
                <PixelCharacter profile={profile} mood={characterMood} size={160} />
              </div>

              <ExpBar profile={profile} />

              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="bg-slate-700 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-yellow-400">{profile.coins}</div>
                  <div className="text-xs text-slate-400">Coins</div>
                </div>
                <div className="bg-slate-700 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-orange-400">{profile.login_streak}</div>
                  <div className="text-xs text-slate-400">Day Streak</div>
                </div>
                <div className="bg-slate-700 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-emerald-400">{activeHabits.length}</div>
                  <div className="text-xs text-slate-400">Quests</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  onClick={() => setCurrentView('character')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    currentView === 'character'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <Scroll className="w-4 h-4" />
                  <span>Character</span>
                </button>
                <button
                  onClick={() => setCurrentView('analytics')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    currentView === 'analytics'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Analytics</span>
                </button>
                <button
                  onClick={() => setCurrentView('shop')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    currentView === 'shop'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Shop</span>
                </button>
                <button
                  onClick={() => setCurrentView('quests')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    currentView === 'quests'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>Quests</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {currentView === 'quests' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-white">Daily Quests</h2>
                  <button
                    onClick={() => {
                      setEditingHabit(undefined);
                      setShowHabitModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-all transform hover:scale-105"
                  >
                    <Plus className="w-5 h-5" />
                    <span>New Quest</span>
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-12 text-slate-400">Loading quests...</div>
                ) : activeHabits.length === 0 ? (
                  <div className="bg-slate-800 rounded-xl border-2 border-slate-700 p-12 text-center">
                    <Award className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No quests yet!</h3>
                    <p className="text-slate-400 mb-6">
                      Start your adventure by creating your first habit quest
                    </p>
                    <button
                      onClick={() => setShowHabitModal(true)}
                      className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-all transform hover:scale-105"
                    >
                      Create First Quest
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeHabits.map((habit) => (
                      <HabitCard
                        key={habit.id}
                        habit={habit}
                        onComplete={handleCompleteHabit}
                        onEdit={(h) => {
                          setEditingHabit(h);
                          setShowHabitModal(true);
                        }}
                        onDelete={handleDeleteHabit}
                        completedToday={completedToday.includes(habit.id)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {currentView === 'character' && <CharacterSheet profile={profile} />}
            {currentView === 'analytics' && <AnalyticsDashboard />}
            {currentView === 'shop' && <CharacterShop profile={profile} onUpdate={refreshProfile} />}
          </div>
        </div>
      </div>

      {showHabitModal && (
        <HabitModal
          habit={editingHabit}
          onSave={handleSaveHabit}
          onClose={() => {
            setShowHabitModal(false);
            setEditingHabit(undefined);
          }}
        />
      )}

      {floatingExps.map((exp) => (
        <FloatingExp
          key={exp.id}
          amount={exp.amount}
          x={exp.x}
          y={exp.y}
          onComplete={() => removeFloatingExp(exp.id)}
        />
      ))}

      {showLevelUp && <LevelUpModal newLevel={newLevel} onClose={() => setShowLevelUp(false)} />}
    </div>
  );
}
