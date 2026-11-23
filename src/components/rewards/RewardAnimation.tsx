import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface RewardAnimationProps {
  title: string;
  subtitle?: string;
}

export const RewardAnimation: React.FC<RewardAnimationProps> = ({
  title,
  subtitle,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 18 }}
      className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#FFD43B] to-[#FF963C] text-[#2A1C00] shadow-[0_0_24px_rgba(255,212,59,0.45)] font-display font-bold"
    >
      <Sparkles className="w-5 h-5 shrink-0" />
      <div className="text-left">
        <p className="text-sm leading-tight">{title}</p>
        {subtitle && <p className="text-[11px] opacity-80 leading-tight">{subtitle}</p>}
      </div>
    </motion.div>
  );
};
