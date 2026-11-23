import React from 'react';
import { Gamepad2, Globe2, Home, Trophy, User } from 'lucide-react';
import { LanguageCode, ScreenRoute } from '../../types/game';
import { getTranslations } from '../../core/localization';
import { audioService } from '../../services/audioService';

interface BottomNavigationProps {
  currentRoute: ScreenRoute;
  lang: LanguageCode;
  onNavigate: (route: ScreenRoute) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentRoute,
  lang,
  onNavigate,
}) => {
  const t = getTranslations(lang);

  const items: Array<{
    id: ScreenRoute;
    matchRoutes: ScreenRoute[];
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    accent: string;
  }> = [
    {
      id: 'home',
      matchRoutes: ['home', 'daily'],
      label: t.navHome,
      icon: Home,
      accent: '#287BFF',
    },
    {
      id: 'worlds',
      matchRoutes: ['worlds', 'levels'],
      label: t.navWorlds,
      icon: Globe2,
      accent: '#35D982',
    },
    {
      id: 'games',
      matchRoutes: ['games', 'toybox3d'],
      label: t.navGames,
      icon: Gamepad2,
      accent: '#A855F7',
    },
    {
      id: 'rewards',
      matchRoutes: ['rewards', 'shop'],
      label: t.navRewards,
      icon: Trophy,
      accent: '#FFD43B',
    },
    {
      id: 'profile',
      matchRoutes: ['profile', 'parent'],
      label: t.navProfile,
      icon: User,
      accent: '#22D3EE',
    },
  ];

  return (
    <nav
      aria-label="Primary Gaming Navigation"
      className="fixed bottom-0 inset-x-0 md:bottom-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 z-40 px-2 pb-[max(0.45rem,env(safe-area-inset-bottom))] pt-1.5 md:p-1.5 bg-[#131A38] md:rounded-2xl border-t md:border border-[#AEBBD9]/20 shadow-[0_-8px_28px_rgba(6,10,28,0.55)] md:shadow-[0_14px_36px_rgba(6,10,28,0.65)]"
    >
      <div className="max-w-lg mx-auto grid grid-cols-5 gap-1 md:flex md:items-center md:gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.matchRoutes.includes(currentRoute);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                audioService.playClick();
                onNavigate(item.id);
              }}
              style={
                active
                  ? {
                      background: `linear-gradient(180deg, ${item.accent}33, ${item.accent}18)`,
                      borderColor: `${item.accent}88`,
                    }
                  : undefined
              }
              className={`flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-2 px-2 md:px-4 py-1.5 md:py-2.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                active
                  ? 'text-white shadow-sm'
                  : 'border-transparent text-[#AEBBD9] hover:text-white hover:bg-[#222E52]/60'
              }`}
            >
              <Icon
                className={`w-5 h-5 md:w-4 md:h-4 ${
                  active ? 'scale-105' : ''
                }`}
              />
              <span className="text-[11px] md:text-sm font-display font-bold leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
