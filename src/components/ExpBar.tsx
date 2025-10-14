import { useEffect, useState } from 'react';
import { Profile } from '../lib/supabase';

interface ExpBarProps {
  profile: Profile;
}

export default function ExpBar({ profile }: ExpBarProps) {
  const [animatedExp, setAnimatedExp] = useState(profile.current_exp);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedExp(profile.current_exp);
    }, 100);

    return () => clearTimeout(timer);
  }, [profile.current_exp]);

  const percentage = (animatedExp / profile.exp_to_next) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-slate-300 font-medium">Level {profile.character_level}</span>
        <span className="text-slate-400">
          {profile.current_exp} / {profile.exp_to_next} EXP
        </span>
      </div>

      <div className="relative h-6 bg-slate-700 rounded-full border-2 border-slate-600 overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white drop-shadow-lg z-10">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
    </div>
  );
}
