import { Habit } from '../lib/supabase';
import { Heart, BookOpen, Briefcase, Sparkles, Users, Flame, Target, Edit2, Trash2 } from 'lucide-react';

interface HabitCardProps {
  habit: Habit;
  onComplete: (habit: Habit) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
  completedToday?: boolean;
}

const categoryIcons = {
  health: Heart,
  learning: BookOpen,
  productivity: Briefcase,
  'self-care': Sparkles,
  social: Users,
};

const categoryColors = {
  health: 'from-red-500 to-pink-500',
  learning: 'from-blue-500 to-indigo-500',
  productivity: 'from-green-500 to-emerald-500',
  'self-care': 'from-purple-500 to-pink-500',
  social: 'from-yellow-500 to-orange-500',
};

const difficultyMultiplier = {
  easy: 1,
  medium: 1.5,
  hard: 2,
};

export default function HabitCard({ habit, onComplete, onEdit, onDelete, completedToday }: HabitCardProps) {
  const Icon = categoryIcons[habit.category];
  const totalExp = Math.round(habit.exp_value * difficultyMultiplier[habit.difficulty]);
  const streakBonus = Math.floor(habit.streak / 7) * 5;

  return (
    <div className={`bg-slate-800 rounded-lg border-2 ${completedToday ? 'border-emerald-500 opacity-75' : 'border-slate-700'} p-4 transition-all hover:shadow-lg hover:scale-105`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${categoryColors[habit.category]}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-white text-lg">{habit.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-1 bg-slate-700 rounded text-slate-300 capitalize">
                {habit.category}
              </span>
              <span className="text-xs px-2 py-1 bg-slate-700 rounded text-slate-300 capitalize">
                {habit.difficulty}
              </span>
              {habit.streak > 0 && (
                <div className="flex items-center gap-1 text-orange-400">
                  <Flame className="w-4 h-4" />
                  <span className="text-xs font-bold">{habit.streak}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(habit)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4 text-slate-400" />
          </button>
          <button
            onClick={() => onDelete(habit)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {habit.notes && (
        <p className="text-sm text-slate-400 mb-3">{habit.notes}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-400 font-bold">
            +{totalExp} EXP
            {streakBonus > 0 && (
              <span className="text-orange-400 ml-1">+{streakBonus} bonus</span>
            )}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.currentTarget.setAttribute('data-habit-id', habit.id);
            onComplete(habit);
          }}
          disabled={completedToday}
          className={`px-4 py-2 rounded-lg font-bold transition-all ${
            completedToday
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : habit.habit_type === 'good'
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white transform hover:scale-105 active:scale-95'
              : 'bg-red-500 hover:bg-red-600 text-white transform hover:scale-105 active:scale-95'
          }`}
        >
          {completedToday ? 'Done!' : habit.habit_type === 'good' ? 'Complete' : 'Mark'}
        </button>
      </div>
    </div>
  );
}
