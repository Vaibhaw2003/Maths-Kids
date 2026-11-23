import React from 'react';
import { Settings, Volume2, VolumeX } from 'lucide-react';
import { AppSettings, ChildProfile, ScreenRoute } from '../../types/game';
import { getTranslations } from '../../core/localization';
import { audioService } from '../../services/audioService';
import { MascotAvatar } from '../gaming/MascotAvatar';
import { RewardCounter } from '../gaming/RewardCounter';
import { XPProgressBar } from '../gaming/XPProgressBar';

interface GameHUDProps {
  profile: ChildProfile;
  settings: AppSettings;
  onToggleSound: () => void;
  onNavigate: (route: ScreenRoute) => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  profile,
  settings,
  onToggleSound,
  onNavigate,
}) => {
  const t = getTranslations(settings.language);

  return (
    <header className="sticky top-0 z-30 bg-[#10152E]/95 border-b border-[#AEBBD9]/15 shadow-[0_8px_24px_rgba(6,10,28,0.45)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-18 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Player Profile + XP Progress */}
        <button
          type="button"
          onClick={() => {
            audioService.playClick();
            onNavigate('profile');
          }}
          className="flex items-center gap-2.5 sm:gap-3 min-w-0 text-left group cursor-pointer"
        >
          <MascotAvatar
            mascotId={profile.mascot}
            outfit={profile.equippedOutfit}
            accessory={profile.equippedCosmetics?.accessory}
            size="sm"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm sm:text-base text-white truncate max-w-[110px] sm:max-w-[180px] group-hover:text-[#22D3EE] transition-colors">
                {profile.nickname}
              </span>
              <span className="hidden md:inline-block text-[11px] font-bold text-[#AEBBD9] px-2 py-0.5 rounded-lg bg-[#222E52] border border-[#AEBBD9]/15">
                {t.appName}
              </span>
            </div>
            <div className="mt-0.5 w-28 sm:w-44">
              <XPProgressBar totalXp={profile.xp || 0} compact showNumbers={false} />
            </div>
          </div>
        </button>

        {/* Right: Stars, Coins, Sound Toggle, Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <div className="sm:hidden flex items-center gap-1.5">
            <RewardCounter type="stars" value={profile.stars} compact />
            <RewardCounter type="coins" value={profile.coins || 0} compact />
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <RewardCounter type="stars" value={profile.stars} />
            <RewardCounter type="coins" value={profile.coins || 0} />
          </div>

          <button
            type="button"
            aria-label={settings.soundEnabled ? 'Mute sound' : 'Unmute sound'}
            onClick={() => {
              onToggleSound();
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#222E52] hover:bg-[#2A3966] border border-[#AEBBD9]/20 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#35D982]" />
            ) : (
              <VolumeX className="w-4 h-4 text-[#AEBBD9]" />
            )}
          </button>

          <button
            type="button"
            aria-label={t.navProfile}
            onClick={() => {
              audioService.playClick();
              onNavigate('profile');
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#222E52] hover:bg-[#2A3966] border border-[#AEBBD9]/20 flex items-center justify-center text-[#22D3EE] transition-colors cursor-pointer shrink-0"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
