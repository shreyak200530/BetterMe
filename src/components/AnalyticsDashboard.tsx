import { useState, useEffect } from 'react';
import { supabase, Habit, HabitLog } from '../lib/supabase';
import { Calendar, TrendingUp, Target, Zap } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [habitsResult, logsResult] = await Promise.all([
        supabase.from('habits').select('*').eq('is_active', true),
        supabase
          .from('habit_logs')
          .select('*')
          .gte('completed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('completed_at', { ascending: false }),
      ]);

      setHabits(habitsResult.data || []);
      setLogs(logsResult.data || []);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTodayStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = logs.filter((log) =>
      log.completed_at.startsWith(today)
    );

    return {
      completed: todayLogs.length,
      total: habits.length,
      exp: todayLogs.reduce((sum, log) => sum + log.exp_earned + log.streak_bonus, 0),
    };
  };

  const getWeeklyStats = () => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weekLogs = logs.filter(
      (log) => new Date(log.completed_at) >= weekAgo
    );

    return {
      completed: weekLogs.length,
      exp: weekLogs.reduce((sum, log) => sum + log.exp_earned + log.streak_bonus, 0),
      avgPerDay: Math.round(weekLogs.length / 7),
    };
  };

  const getMonthlyStats = () => {
    const monthLogs = logs;

    return {
      completed: monthLogs.length,
      exp: monthLogs.reduce((sum, log) => sum + log.exp_earned + log.streak_bonus, 0),
      avgPerDay: Math.round(monthLogs.length / 30),
    };
  };

  const getTopHabits = () => {
    const habitCounts = habits.map((habit) => {
      const count = logs.filter((log) => log.habit_id === habit.id).length;
      return { habit, count };
    });

    return habitCounts.sort((a, b) => b.count - a.count).slice(0, 5);
  };

  const getCategoryBreakdown = () => {
    const categories = ['health', 'learning', 'productivity', 'self-care', 'social'];
    return categories.map((category) => {
      const categoryHabits = habits.filter((h) => h.category === category);
      const categoryLogs = logs.filter((log) =>
        categoryHabits.some((h) => h.id === log.habit_id)
      );

      return {
        category,
        count: categoryLogs.length,
        exp: categoryLogs.reduce((sum, log) => sum + log.exp_earned + log.streak_bonus, 0),
      };
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-slate-400">
        Loading analytics...
      </div>
    );
  }

  const todayStats = getTodayStats();
  const weeklyStats = getWeeklyStats();
  const monthlyStats = getMonthlyStats();
  const topHabits = getTopHabits();
  const categoryBreakdown = getCategoryBreakdown();

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Quest Analytics</h2>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl border-2 border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-500 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">Today</h3>
              <p className="text-slate-400 text-sm">Your daily progress</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Completed:</span>
              <span className="text-white font-bold">
                {todayStats.completed} / {todayStats.total}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">EXP Earned:</span>
              <span className="text-emerald-400 font-bold">+{todayStats.exp}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border-2 border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-500 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">This Week</h3>
              <p className="text-slate-400 text-sm">7-day performance</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Completed:</span>
              <span className="text-white font-bold">{weeklyStats.completed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Daily Avg:</span>
              <span className="text-white font-bold">{weeklyStats.avgPerDay}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total EXP:</span>
              <span className="text-emerald-400 font-bold">+{weeklyStats.exp}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border-2 border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-500 p-3 rounded-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">This Month</h3>
              <p className="text-slate-400 text-sm">30-day summary</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Completed:</span>
              <span className="text-white font-bold">{monthlyStats.completed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Daily Avg:</span>
              <span className="text-white font-bold">{monthlyStats.avgPerDay}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total EXP:</span>
              <span className="text-emerald-400 font-bold">+{monthlyStats.exp}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border-2 border-slate-700 p-6">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Top Performing Quests
        </h3>
        <div className="space-y-3">
          {topHabits.length > 0 ? (
            topHabits.map(({ habit, count }) => (
              <div
                key={habit.id}
                className="flex items-center justify-between bg-slate-700 rounded-lg p-3"
              >
                <div>
                  <div className="font-medium text-white">{habit.name}</div>
                  <div className="text-sm text-slate-400 capitalize">{habit.category}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-400">{count}</div>
                  <div className="text-xs text-slate-400">completions</div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-center py-4">
              No data yet. Start completing quests!
            </p>
          )}
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border-2 border-slate-700 p-6">
        <h3 className="font-bold text-white mb-4">Category Breakdown</h3>
        <div className="space-y-3">
          {categoryBreakdown.map(({ category, count, exp }) => (
            <div key={category} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 capitalize">{category}</span>
                <div className="text-sm text-slate-400">
                  {count} completions • +{exp} EXP
                </div>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
                  style={{
                    width: `${(count / Math.max(...categoryBreakdown.map((c) => c.count), 1)) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
