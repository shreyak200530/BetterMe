import { useEffect, useState } from 'react';
import { Trophy, Sparkles, Star } from 'lucide-react';

interface LevelUpModalProps {
  newLevel: number;
  onClose: () => void;
}

export default function LevelUpModal({ newLevel, onClose }: LevelUpModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className={`relative bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-500 rounded-2xl p-8 shadow-2xl border-4 border-yellow-400 transform transition-all duration-500 ${show ? 'scale-100' : 'scale-50'}`}>
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="confetti" />
        </div>

        <div className="relative z-10 text-center space-y-4">
          <div className="flex justify-center animate-bounce">
            <Trophy className="w-20 h-20 text-white drop-shadow-lg" />
          </div>

          <div className="space-y-2">
            <h2 className="text-4xl font-bold text-white drop-shadow-lg">
              LEVEL UP!
            </h2>
            <div className="flex items-center justify-center gap-2">
              <Star className="w-6 h-6 text-white animate-pulse" />
              <p className="text-6xl font-bold text-white drop-shadow-lg">
                {newLevel}
              </p>
              <Star className="w-6 h-6 text-white animate-pulse" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-white/90">
            <Sparkles className="w-5 h-5" />
            <p className="text-lg font-medium">
              You're becoming unstoppable!
            </p>
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
