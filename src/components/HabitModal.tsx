import { useState } from 'react';
import { X } from 'lucide-react';
import { Habit } from '../lib/supabase';

interface HabitModalProps {
  habit?: Habit;
  onSave: (habitData: Partial<Habit>) => Promise<void>;
  onClose: () => void;
}

const categories = [
  { value: 'health', label: 'Health & Fitness', exp: '25-30' },
  { value: 'learning', label: 'Learning & Growth', exp: '20-25' },
  { value: 'productivity', label: 'Productivity', exp: '15-20' },
  { value: 'self-care', label: 'Self-Care', exp: '20-25' },
  { value: 'social', label: 'Social', exp: '15-20' },
];

const difficulties = [
  { value: 'easy', label: 'Easy', multiplier: '1x' },
  { value: 'medium', label: 'Medium', multiplier: '1.5x' },
  { value: 'hard', label: 'Hard', multiplier: '2x' },
];

export default function HabitModal({ habit, onSave, onClose }: HabitModalProps) {
  const [formData, setFormData] = useState({
    name: habit?.name || '',
    category: habit?.category || 'health',
    habit_type: habit?.habit_type || 'good',
    exp_value: habit?.exp_value || 20,
    difficulty: habit?.difficulty || 'medium',
    notes: habit?.notes || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving habit:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-slate-800 rounded-xl border-2 border-slate-700 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {habit ? 'Edit Habit' : 'New Habit Quest'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Habit Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              placeholder="Morning exercise"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              className="w-full px-4 py-2 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label} ({cat.exp} EXP)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Type
            </label>
            <div className="flex gap-3">
              <label className="flex-1">
                <input
                  type="radio"
                  value="good"
                  checked={formData.habit_type === 'good'}
                  onChange={(e) => setFormData({ ...formData, habit_type: e.target.value as any })}
                  className="sr-only peer"
                />
                <div className="p-3 bg-slate-700 border-2 border-slate-600 rounded-lg cursor-pointer peer-checked:border-emerald-500 peer-checked:bg-emerald-500/20 text-center transition-all">
                  <span className="text-white font-medium">Good Habit</span>
                </div>
              </label>
              <label className="flex-1">
                <input
                  type="radio"
                  value="bad"
                  checked={formData.habit_type === 'bad'}
                  onChange={(e) => setFormData({ ...formData, habit_type: e.target.value as any })}
                  className="sr-only peer"
                />
                <div className="p-3 bg-slate-700 border-2 border-slate-600 rounded-lg cursor-pointer peer-checked:border-red-500 peer-checked:bg-red-500/20 text-center transition-all">
                  <span className="text-white font-medium">Bad Habit</span>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Difficulty
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
              className="w-full px-4 py-2 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            >
              {difficulties.map((diff) => (
                <option key={diff.value} value={diff.value}>
                  {diff.label} ({diff.multiplier} EXP)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Base EXP Value
            </label>
            <input
              type="number"
              value={formData.exp_value}
              onChange={(e) => setFormData({ ...formData, exp_value: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              min="5"
              max="50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 resize-none"
              rows={3}
              placeholder="30 minutes of cardio"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? 'Saving...' : habit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
