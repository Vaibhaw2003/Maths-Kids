import React from 'react';
import { Coins, Flame, Star } from 'lucide-react';

interface RewardCounterProps {
  type: 'stars' | 'coins' | 'streak';
  value: number;
  compact?: boolean;
}

export const RewardCounter: React.FC<RewardCounterProps> = ({
  type,
  value,
  compact = false,
}) => {
  const config =
    type === 'stars'
      ? {
          icon: Star,
          iconCls: 'fill-[#FFD43B] text-[#FFD43B]',
          borderCls: 'border-[#FFD43B]/35',
          textCls: 'text-[#FFD43B]',
          bgCls: 'bg-[#192344]',
        }
      : type === 'coins'
      ? {
          icon: Coins,
          iconCls: 'text-[#22D3EE]',
          borderCls: 'border-[#22D3EE]/35',
          textCls: 'text-[#22D3EE]',
          bgCls: 'bg-[#192344]',
        }
      : {
          icon: Flame,
          iconCls: 'fill-[#FF963C] text-[#FF963C]',
          borderCls: 'border-[#FF963C]/35',
          textCls: 'text-[#FF963C]',
          bgCls: 'bg-[#192344]',
        };

  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-xl border ${config.borderCls} ${config.bgCls} ${
        compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'
      } font-display font-bold tabular-nums shadow-sm whitespace-nowrap shrink-0`}
    >
      <Icon className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} ${config.iconCls}`} />
      <span className={config.textCls}>{value}</span>
    </div>
  );
};
