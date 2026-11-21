import React from 'react';
import { Volume2, Crown, Glasses, Sparkles, Shield } from 'lucide-react';
import { LanguageCode, MASCOTS, MascotId, OutfitId } from '../types/game';
import { getTranslations } from '../core/localization';
import { SafeImage } from './SafeImage';
import { audioService } from '../services/audioService';

interface MascotCompanionProps {
  mascotId: MascotId;
  outfit?: OutfitId;
  message?: string;
  lang: LanguageCode;
  size?: 'sm' | 'md' | 'lg';
  showVoiceButton?: boolean;
  mood?: 'happy' | 'celebrating' | 'thinking';
}

export const MascotCompanion: React.FC<MascotCompanionProps> = ({
  mascotId,
  outfit = 'default',
  message,
  lang,
  size = 'md',
  showVoiceButton = true,
  mood = 'happy',
}) => {
  const mascot = MASCOTS[mascotId];
  const t = getTranslations(lang);
  const mascotName = t[mascot.nameKey];

  const boxSize =
    size === 'sm' ? 'w-16 h-16' : size === 'lg' ? 'w-28 h-28 sm:w-32 sm:h-32' : 'w-20 h-20 sm:w-24 sm:h-24';

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0">
        <div
          className={`${boxSize} rounded-3xl bg-white border-2 border-slate-200 shadow-sm overflow-hidden flex items-center justify-center ${
            mood === 'celebrating' ? 'animate-star-burst' : 'animate-float'
          }`}
          style={{ borderColor: mascot.accentColor }}
        >
          <SafeImage
            src={mascot.image}
            alt={mascotName}
            fallbackLabel={mascotName}
            fallbackBg={mascot.surfaceTint}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Equipped Outfit Accessory Overlay */}
        {outfit === 'crown' && (
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#FFD83D] border-2 border-amber-600 flex items-center justify-center shadow-sm"
            title="Golden Math Crown"
          >
            <Crown className="w-4 h-4 text-amber-900" />
          </div>
        )}
        {outfit === 'glasses' && (
          <div
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#9755F5] border-2 border-white flex items-center justify-center shadow-sm"
            title="Smart Star Glasses"
          >
            <Glasses className="w-4 h-4 text-white" />
          </div>
        )}
        {outfit === 'cape' && (
          <div
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#FF55AE] border-2 border-white flex items-center justify-center shadow-sm"
            title="Super Hero Cape"
          >
            <Shield className="w-4 h-4 text-white" />
          </div>
        )}
        {outfit === 'wizard' && (
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#287BFF] border-2 border-white flex items-center justify-center shadow-sm"
            title="Number Wizard"
          >
            <Sparkles className="w-4 h-4 text-[#FFD83D]" />
          </div>
        )}
      </div>

      {message && (
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-slate-500 mb-0.5">{mascotName}</p>
            <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug">{message}</p>
          </div>
          {showVoiceButton && (
            <button
              type="button"
              onClick={() => audioService.speak(message, lang, true)}
              className="shrink-0 w-11 h-11 rounded-xl bg-[#EEF5FF] hover:bg-[#DCEBFF] text-[#287BFF] flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-[#287BFF]"
              aria-label={t.hearQuestion}
              title={t.hearQuestion}
            >
              <Volume2 className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
