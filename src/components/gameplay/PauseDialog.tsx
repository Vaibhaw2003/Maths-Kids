import React from 'react';
import { Home, Play, RotateCcw } from 'lucide-react';
import { LanguageCode } from '../../types/game';
import { getTranslations } from '../../core/localization';
import { GameButton } from '../gaming/GameButton';

interface PauseDialogProps {
  open: boolean;
  lang: LanguageCode;
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
}

export const PauseDialog: React.FC<PauseDialogProps> = ({
  open,
  lang,
  onResume,
  onRestart,
  onExit,
}) => {
  if (!open) return null;
  const t = getTranslations(lang);

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0E21]/80 flex items-center justify-center p-4">
      <div className="gaming-panel rounded-3xl p-6 sm:p-7 max-w-sm w-full text-center space-y-5 border-2 border-[#22D3EE]/35">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
          {t.pauseTitle}
        </h2>
        <div className="space-y-3">
          <GameButton variant="success" size="lg" fullWidth onClick={onResume}>
            <Play className="w-5 h-5 fill-current" />
            <span>{t.resumeGame}</span>
          </GameButton>

          <GameButton variant="primary" size="lg" fullWidth onClick={onRestart}>
            <RotateCcw className="w-5 h-5" />
            <span>{t.restartGame}</span>
          </GameButton>

          <GameButton variant="secondary" size="lg" fullWidth onClick={onExit}>
            <Home className="w-5 h-5" />
            <span>{t.exitToMap}</span>
          </GameButton>
        </div>
      </div>
    </div>
  );
};
