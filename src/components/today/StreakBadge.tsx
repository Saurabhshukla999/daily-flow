import { Flame } from 'lucide-react';

interface StreakBadgeProps {
  streak: number;
}

export default function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak === 0) return null;

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-pink/15 border border-accent-pink/30">
      <Flame className="w-4 h-4 text-accent-pink" />
      <span className="text-sm font-mono font-medium text-accent-pink">
        {streak} day streak
      </span>
    </div>
  );
}
