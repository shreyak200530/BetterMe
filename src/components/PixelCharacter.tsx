import { useEffect, useState } from 'react';
import { Profile } from '../lib/supabase';

interface PixelCharacterProps {
  profile: Profile;
  mood?: 'idle' | 'happy' | 'sad';
  size?: number;
}

export default function PixelCharacter({ profile, mood = 'idle', size = 128 }: PixelCharacterProps) {
  const [animationFrame, setAnimationFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame((prev) => (prev + 1) % 2);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const getCharacterColor = () => {
    if (profile.character_level >= 26) return 'from-yellow-400 to-amber-500';
    if (profile.character_level >= 21) return 'from-purple-400 to-purple-600';
    if (profile.character_level >= 16) return 'from-blue-400 to-blue-600';
    if (profile.character_level >= 11) return 'from-green-400 to-green-600';
    if (profile.character_level >= 6) return 'from-cyan-400 to-cyan-600';
    return 'from-slate-400 to-slate-600';
  };

  const hasHat = profile.equipped_items?.some(item => item.startsWith('hat_')) ||
                profile.character_level >= 6;
  const hasShirt = profile.equipped_items?.some(item => item.startsWith('shirt_')) ||
                   profile.character_level >= 11;
  const hasAccessory = profile.equipped_items?.some(item => item.startsWith('acc_')) ||
                       profile.character_level >= 16;
  const hasEffect = profile.equipped_items?.some(item => item.startsWith('effect_')) ||
                    profile.character_level >= 26;
  const hasCompanion = profile.equipped_items?.some(item => item.startsWith('companion_')) ||
                       profile.character_level >= 31;

  const bounceClass = mood === 'happy' ? 'animate-bounce' : '';
  const shakeClass = mood === 'sad' ? 'animate-shake' : '';

  return (
    <div className="relative flex items-center justify-center">
      {hasEffect && (
        <div className="absolute inset-0 animate-pulse">
          <div className={`w-full h-full rounded-full bg-gradient-to-br ${getCharacterColor()} blur-xl opacity-30`} />
        </div>
      )}

      <div className={`relative ${bounceClass} ${shakeClass}`} style={{ width: size, height: size }}>
        <svg
          viewBox="0 0 64 64"
          className="w-full h-full pixelated"
          style={{ imageRendering: 'pixelated' }}
        >
          <rect x="20" y="20" width="24" height="28" fill="#ffdbac" />
          <rect x="18" y="22" width="2" height="4" fill="#ffdbac" />
          <rect x="44" y="22" width="2" height="4" fill="#ffdbac" />

          <rect x="24" y="28" width="4" height="2" fill="#000" />
          <rect x="36" y="28" width="4" height="2" fill="#000" />

          {mood === 'happy' && (
            <>
              <rect x="26" y="36" width="2" height="2" fill="#000" />
              <rect x="28" y="38" width="8" height="2" fill="#000" />
              <rect x="36" y="36" width="2" height="2" fill="#000" />
            </>
          )}

          {mood === 'sad' && (
            <>
              <rect x="26" y="38" width="2" height="2" fill="#000" />
              <rect x="28" y="36" width="8" height="2" fill="#000" />
              <rect x="36" y="38" width="2" height="2" fill="#000" />
            </>
          )}

          {mood === 'idle' && (
            <rect x="28" y="36" width="8" height="2" fill="#000" />
          )}

          {hasHat && (
            <>
              <rect x="22" y="14" width="20" height="6" fill="#e74c3c" />
              <rect x="20" y="16" width="24" height="4" fill="#c0392b" />
            </>
          )}

          {hasShirt && (
            <>
              <rect x="18" y="48" width="8" height="12" fill="#3498db" />
              <rect x="38" y="48" width="8" height="12" fill="#3498db" />
              <rect x="26" y="48" width="12" height="14" fill="#2980b9" />
            </>
          )}

          {hasAccessory && (
            <>
              <rect x="22" y="26" width="8" height="2" fill="#34495e" className="opacity-50" />
              <rect x="34" y="26" width="8" height="2" fill="#34495e" className="opacity-50" />
            </>
          )}

          <rect x="20" y="60" width="8" height="4" fill="#2c3e50" />
          <rect x="36" y="60" width="8" height="4" fill="#2c3e50" />
        </svg>

        {hasCompanion && (
          <div className="absolute -right-8 bottom-0" style={{ transform: `translateY(${animationFrame * 2}px)` }}>
            <svg viewBox="0 0 24 24" className="w-8 h-8 pixelated" style={{ imageRendering: 'pixelated' }}>
              <rect x="6" y="8" width="12" height="12" fill="#f39c12" />
              <rect x="8" y="6" width="2" height="2" fill="#000" />
              <rect x="14" y="6" width="2" height="2" fill="#000" />
              <rect x="10" y="14" width="4" height="2" fill="#000" />
              <rect x="4" y="10" width="2" height="4" fill="#f39c12" />
              <rect x="18" y="10" width="2" height="4" fill="#f39c12" />
              <rect x="8" y="20" width="2" height="2" fill="#000" />
              <rect x="14" y="20" width="2" height="2" fill="#000" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
