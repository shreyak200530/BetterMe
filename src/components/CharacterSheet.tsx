import { Profile } from '../lib/supabase';
import { Trophy, Target, TrendingUp, Star } from 'lucide-react';

interface CharacterSheetProps {
  profile: Profile;
}

export default function CharacterSheet({ profile }: CharacterSheetProps) {
  const getLevelProgress = () => {
    return Math.round((profile.current_exp / profile.exp_to_next) * 100);
  };

  const getNextMilestone = () => {
    const nextMilestone = Math.ceil(profile.character_level / 5) * 5;
    return nextMilestone;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Character Sheet</h2>

      <div className="bg-slate-800 rounded-xl border-2 border-slate-700 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 rounded-xl">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Level {profile.character_level}</h3>
            <p className="text-slate-400">Hero in Training</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-emerald-400" />
              <span className="text-slate-300 text-sm">Total EXP</span>
            </div>
            <div className="text-2xl font-bold text-white">{profile.total_exp.toLocaleString()}</div>
          </div>

          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span className="text-slate-300 text-sm">Level Progress</span>
            </div>
            <div className="text-2xl font-bold text-white">{getLevelProgress()}%</div>
          </div>

          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-slate-300 text-sm">Coins</span>
            </div>
            <div className="text-2xl font-bold text-white">{profile.coins}</div>
          </div>

          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-orange-400" />
              <span className="text-slate-300 text-sm">Login Streak</span>
            </div>
            <div className="text-2xl font-bold text-white">{profile.login_streak} days</div>
          </div>
        </div>

        <div className="border-t-2 border-slate-700 pt-6">
          <h4 className="font-bold text-white mb-4">Next Milestone</h4>
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300">Level {getNextMilestone()}</span>
              <span className="text-slate-400 text-sm">
                {getNextMilestone() - profile.character_level} levels to go
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Unlock new customization items and visual upgrades!
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border-2 border-slate-700 p-6">
        <h3 className="font-bold text-white mb-4">Equipped Items</h3>
        {profile.equipped_items && profile.equipped_items.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {profile.equipped_items.map((itemId) => (
              <div
                key={itemId}
                className="bg-slate-700 rounded-lg p-3 text-center"
              >
                <div className="text-sm text-slate-300 capitalize">
                  {itemId.replace(/_/g, ' ')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-4">
            No items equipped yet. Visit the shop to customize your character!
          </p>
        )}
      </div>

      <div className="bg-slate-800 rounded-xl border-2 border-slate-700 p-6">
        <h3 className="font-bold text-white mb-4">Unlocked Items</h3>
        {profile.unlocked_items && profile.unlocked_items.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {profile.unlocked_items.map((itemId) => (
              <div
                key={itemId}
                className="bg-slate-700 rounded-lg p-3 text-center"
              >
                <div className="text-xs text-slate-300 capitalize">
                  {itemId.replace(/_/g, ' ')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-4">
            No items unlocked yet. Keep leveling up!
          </p>
        )}
      </div>
    </div>
  );
}
