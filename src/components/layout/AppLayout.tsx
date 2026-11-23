import React from 'react';
import { AppSettings, ChildProfile, ScreenRoute } from '../../types/game';
import { GameHUD } from './GameHUD';
import { BottomNavigation } from './BottomNavigation';

interface AppLayoutProps {
  route: ScreenRoute;
  profile: ChildProfile;
  settings: AppSettings;
  onToggleSound: () => void;
  onNavigate: (route: ScreenRoute) => void;
  children: React.ReactNode;
}

const FULLSCREEN_ROUTES: ScreenRoute[] = ['splash', 'play', 'toybox3d'];

export const AppLayout: React.FC<AppLayoutProps> = ({
  route,
  profile,
  settings,
  onToggleSound,
  onNavigate,
  children,
}) => {
  const isFullscreen = FULLSCREEN_ROUTES.includes(route);
  const envTheme = profile.equippedCosmetics?.envTheme || 'default';

  const bgGradientStyle: React.CSSProperties =
    envTheme === 'theme_aurora'
      ? {
          background:
            'radial-gradient(circle at 18% 12%, rgba(34, 211, 238, 0.16), transparent 45%), radial-gradient(circle at 82% 80%, rgba(53, 217, 130, 0.12), transparent 45%), #10152E',
        }
      : envTheme === 'theme_cosmic'
      ? {
          background:
            'radial-gradient(circle at 20% 10%, rgba(168, 85, 247, 0.2), transparent 48%), radial-gradient(circle at 85% 75%, rgba(40, 123, 255, 0.16), transparent 48%), #10152E',
        }
      : {
          background:
            'radial-gradient(circle at 15% 10%, rgba(40, 123, 255, 0.15), transparent 45%), radial-gradient(circle at 85% 85%, rgba(168, 85, 247, 0.12), transparent 45%), #10152E',
        };

  return (
    <div style={bgGradientStyle} className="min-h-screen flex flex-col text-white overflow-x-hidden">
      {!isFullscreen && (
        <GameHUD
          profile={profile}
          settings={settings}
          onToggleSound={onToggleSound}
          onNavigate={onNavigate}
        />
      )}

      <main className={`flex-1 ${!isFullscreen ? 'pb-24 md:pb-24' : ''}`}>{children}</main>

      {!isFullscreen && (
        <BottomNavigation
          currentRoute={route}
          lang={settings.language}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
};
