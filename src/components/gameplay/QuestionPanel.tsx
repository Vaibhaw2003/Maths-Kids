import React from 'react';
import { Lightbulb, Volume2 } from 'lucide-react';
import { LanguageCode } from '../../types/game';
import { getTranslations } from '../../core/localization';
import { audioService } from '../../services/audioService';

interface QuestionPanelProps {
  title: string;
  promptText: string;
  lang: LanguageCode;
  onHint?: () => void;
}

export const QuestionPanel: React.FC<QuestionPanelProps> = ({
  title,
  promptText,
  lang,
  onHint,
}) => {
  const t = getTranslations(lang);

  return (
    <div className="gaming-card rounded-2xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-display font-bold uppercase tracking-wider text-[#22D3EE]">
          {title}
        </p>
        <p className="text-sm sm:text-base font-display font-bold text-white truncate">
          {promptText}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => {
            audioService.playClick();
            audioService.speak(promptText, lang, true);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#287BFF]/20 hover:bg-[#287BFF]/35 border border-[#287BFF]/45 text-[#22D3EE] text-xs font-display font-bold transition-colors cursor-pointer"
        >
          <Volume2 className="w-4 h-4" />
          <span>{t.hearQuestion}</span>
        </button>

        {onHint && (
          <button
            type="button"
            onClick={() => {
              audioService.playClick();
              onHint();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FFD43B]/15 hover:bg-[#FFD43B]/25 border border-[#FFD43B]/45 text-[#FFD43B] text-xs font-display font-bold transition-colors cursor-pointer"
          >
            <Lightbulb className="w-4 h-4" />
            <span>{t.hintButton}</span>
          </button>
        )}
      </div>
    </div>
  );
};
