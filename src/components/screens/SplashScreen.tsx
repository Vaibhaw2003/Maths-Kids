import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Star } from 'lucide-react';
import { LanguageCode, MASCOTS, MascotId } from '../../types/game';
import { getTranslations } from '../../core/localization';
import { SafeImage } from '../SafeImage';

interface SplashScreenProps {
  mascotId: MascotId;
  lang: LanguageCode;
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  mascotId,
  lang,
  onFinish,
}) => {
  const t = getTranslations(lang);
  const mascot = MASCOTS[mascotId] || MASCOTS.leo;
  const [progress, setProgress] = useState(14);

  useEffect(() => {
    const t1 = window.setTimeout(() => setProgress(58), 320);
    const t2 = window.setTimeout(() => setProgress(100), 950);
    const t3 = window.setTimeout(() => onFinish(), 1550);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [onFinish]);

  return (
    <div
      onClick={onFinish}
      className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden cursor-pointer select-none"
      style={{
        background:
          'radial-gradient(circle at 50% 30%, rgba(40, 123, 255, 0.28), transparent 55%), radial-gradient(circle at 80% 75%, rgba(168, 85, 247, 0.22), transparent 50%), #10152E',
      }}
    >
      {/* Floating Decorative Stars */}
      <motion.div
        animate={{ y: [-6, 8, -6], rotate: [-8, 8, -8] }}
        transition={{ repeat: Infinity, duration: 3.4, ease: 'easeInOut' }}
        className="absolute top-14 left-[14%] text-[#FFD43B]"
      >
        <Star className="w-8 h-8 fill-[#FFD43B]" />
      </motion.div>
      <motion.div
        animate={{ y: [8, -8, 8], rotate: [8, -8, 8] }}
        transition={{ repeat: Infinity, duration: 3.8, ease: 'easeInOut' }}
        className="absolute top-24 right-[15%] text-[#22D3EE]"
      >
        <Sparkles className="w-9 h-9" />
      </motion.div>
      <motion.div
        animate={{ y: [-5, 7, -5] }}
        transition={{ repeat: Infinity, duration: 3.0, ease: 'easeInOut' }}
        className="absolute bottom-24 left-[18%] text-[#35D982]"
      >
        <Star className="w-6 h-6 fill-[#35D982]" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 flex flex-col items-center text-center max-w-md w-full"
      >
        {/* Animated Mascot Emblem */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
          className="relative p-1.5 rounded-[2rem] bg-gradient-to-br from-[#22D3EE] via-[#287BFF] to-[#A855F7] shadow-[0_0_40px_rgba(34,211,238,0.4)] mb-6"
        >
          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-[1.7rem] overflow-hidden bg-[#192344]">
            <SafeImage
              src={mascot.image}
              alt={t[mascot.nameKey]}
              fallbackBg={mascot.surfaceTint}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-xl bg-[#FFD43B] text-[#2A1C00] text-xs font-display font-bold shadow-md whitespace-nowrap">
            {t[mascot.nameKey]}
          </div>
        </motion.div>

        <p className="text-xs font-display font-bold uppercase tracking-[0.2em] text-[#22D3EE] mb-2">
          {t.editionBadge}
        </p>
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-white tracking-tight">
          {t.appName}
        </h1>
        <p className="text-sm sm:text-base text-[#AEBBD9] mt-2">
          {t.appSubtitle}
        </p>

        {/* Glowing Adventure Loader */}
        <div className="w-full max-w-xs mt-8 space-y-2.5">
          <div className="h-3.5 rounded-full bg-[#192344] border border-[#AEBBD9]/20 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#22D3EE] via-[#287BFF] to-[#A855F7] transition-all duration-500 shadow-[0_0_12px_rgba(34,211,238,0.55)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs font-semibold text-[#AEBBD9]">
            {lang === 'hi' ? '3D एडवेंचर लोड हो रहा है... (टैप करें)' : 'Loading 3D Adventure... Tap anywhere'}
          </p>
        </div>
      </motion.div>
    </div>
  );
};
