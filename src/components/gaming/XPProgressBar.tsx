import React from 'react';
import { getPlayerLevelInfo } from '../../services/progressionService';

interface XPProgressBarProps {
  totalXp: number;
  compact?: boolean;
  showNumbers?: boolean;
}

export const XPProgressBar: React.FC<XPProgressBarProps> = ({
  totalXp,
  compact = false,
  showNumbers = true,
}) => {
  const info = getPlayerLevelInfo(totalXp);

  return (
    <div className="flex items-center gap-2 min-w-0">
      <div
        className={`shrink-0 inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-[#22D3EE] to-[#287BFF] text-white font-display font-bold shadow-[0_0_12px_rgba(34,211,238,0.35)] tabular-nums ${
          compact ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
        }`}
      >
        LV {info.level}
      </div>
      <div className="flex-1 min-w-[64px]">
        <div
          className={`w-full bg-[#10152E] rounded-full overflow-hidden border border-[#AEBBD9]/20 ${
            compact ? 'h-2' : 'h-2.5'
          }`}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#22D3EE] via-[#287BFF] to-[#A855F7] transition-all duration-500"
            style={{ width: `${Math.max(6, info.percent)}%` }}
          />
        </div>
        {showNumbers && !compact && (
          <p className="text-[10px] font-bold text-[#AEBBD9] mt-0.5 tabular-nums">
            {info.currentLevelXp} / {info.xpForNextLevel} XP
          </p>
        )}
      </div>
    </div>
  );
};
