import React from 'react';
import { Crown, Glasses, Shield, Sparkles } from 'lucide-react';
import { MASCOTS, MascotId, OutfitId } from '../../types/game';
import { SafeImage } from '../SafeImage';

interface MascotAvatarProps {
  mascotId: MascotId;
  outfit?: OutfitId;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
  accessory?: string;
}

const SIZE_MAP = {
  xs: 'w-9 h-9 rounded-xl',
  sm: 'w-11 h-11 rounded-xl',
  md: 'w-16 h-16 rounded-2xl',
  lg: 'w-24 h-24 rounded-2xl',
  xl: 'w-28 h-28 sm:w-32 sm:h-32 rounded-3xl',
};

export const MascotAvatar: React.FC<MascotAvatarProps> = ({
  mascotId,
  outfit = 'default',
  size = 'md',
  glow = true,
  accessory = 'none',
}) => {
  const mascot = MASCOTS[mascotId] || MASCOTS.leo;

  return (
    <div
      className={`relative shrink-0 ${SIZE_MAP[size]} p-0.5 bg-gradient-to-br from-[#22D3EE] via-[#287BFF] to-[#A855F7] ${
        glow ? 'shadow-[0_0_18px_rgba(34,211,238,0.28)]' : ''
      }`}
    >
      <div className="w-full h-full rounded-[inherit] overflow-hidden bg-[#10152E] relative">
        <SafeImage
          src={mascot.image}
          alt={mascotId}
          fallbackBg={mascot.surfaceTint}
          className="w-full h-full object-cover"
        />
      </div>

      {outfit === 'crown' && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#FFD43B] text-[#2A1C00] rounded-lg p-0.5 border border-[#10152E] shadow">
          <Crown className={size === 'xs' || size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
        </div>
      )}

      {outfit === 'glasses' && (
        <div className="absolute -bottom-1 -right-1 bg-[#22D3EE] text-[#06242C] rounded-lg p-0.5 border border-[#10152E] shadow">
          <Glasses className={size === 'xs' || size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        </div>
      )}

      {outfit === 'cape' && (
        <div className="absolute -bottom-1 -right-1 bg-[#FF5B6E] text-white rounded-lg p-0.5 border border-[#10152E] shadow">
          <Shield className={size === 'xs' || size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        </div>
      )}

      {(outfit === 'wizard' || (accessory && accessory !== 'none')) && (
        <div className="absolute -top-1.5 -right-1.5 bg-[#A855F7] text-white rounded-lg p-0.5 border border-[#10152E] shadow">
          <Sparkles className={size === 'xs' || size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        </div>
      )}
    </div>
  );
};
