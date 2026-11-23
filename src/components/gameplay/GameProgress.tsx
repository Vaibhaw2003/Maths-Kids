import React from 'react';

interface GameProgressProps {
  label: string;
  current: number;
  total: number;
  accentHex?: string;
}

export const GameProgress: React.FC<GameProgressProps> = ({
  label,
  current,
  total,
  accentHex = '#22D3EE',
}) => {
  const pct = Math.min(100, Math.round((current / Math.max(1, total)) * 100));

  return (
    <div className="flex-1 min-w-[150px] max-w-md">
      <div className="flex items-center justify-between text-xs font-display font-bold mb-1">
        <span className="text-[#AEBBD9] truncate pr-2">{label}</span>
        <span className="text-[#22D3EE] tabular-nums shrink-0">
          {current} / {total}
        </span>
      </div>
      <div className="h-3 rounded-full bg-[#10152E] border border-[#AEBBD9]/20 overflow-hidden p-0.5">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${Math.max(8, pct)}%`,
            background: `linear-gradient(90deg, ${accentHex}, #287BFF)`,
          }}
        />
      </div>
    </div>
  );
};
