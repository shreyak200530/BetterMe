import { useEffect, useState } from 'react';

interface FloatingExpProps {
  amount: number;
  x: number;
  y: number;
  onComplete: () => void;
}

export default function FloatingExp({ amount, x, y, onComplete }: FloatingExpProps) {
  const [isVisible, setIsVisible] = useState(true);
  const isPositive = amount > 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed pointer-events-none z-50 animate-float-up"
      style={{ left: x, top: y }}
    >
      <div className={`text-2xl font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'} drop-shadow-lg`}>
        {isPositive ? '+' : ''}{amount} EXP
      </div>
    </div>
  );
}
