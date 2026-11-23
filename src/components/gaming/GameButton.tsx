import React from 'react';
import { motion } from 'motion/react';
import { audioService } from '../../services/audioService';

export type GameButtonVariant =
  | 'primary'
  | 'success'
  | 'yellow'
  | 'purple'
  | 'cyan'
  | 'danger'
  | 'secondary';

interface GameButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: GameButtonVariant;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const VARIANT_CLASSES: Record<GameButtonVariant, string> = {
  primary:
    'bg-gradient-to-b from-[#3B8BFF] to-[#287BFF] hover:from-[#4C96FF] hover:to-[#1F6CE8] text-white border-b-4 border-[#1552B8] shadow-[0_6px_20px_rgba(40,123,255,0.38)]',
  success:
    'bg-gradient-to-b from-[#43E890] to-[#35D982] hover:from-[#54EE9B] hover:to-[#29C270] text-[#08291A] border-b-4 border-[#1C9856] shadow-[0_6px_20px_rgba(53,217,130,0.35)]',
  yellow:
    'bg-gradient-to-b from-[#FFE066] to-[#FFD43B] hover:from-[#FFE885] hover:to-[#F7C41B] text-[#2A1C00] border-b-4 border-[#C99600] shadow-[0_6px_20px_rgba(255,212,59,0.34)]',
  purple:
    'bg-gradient-to-b from-[#BA73FF] to-[#A855F7] hover:from-[#C78CFF] hover:to-[#933DE6] text-white border-b-4 border-[#7221C4] shadow-[0_6px_20px_rgba(168,85,247,0.35)]',
  cyan:
    'bg-gradient-to-b from-[#4CE2F7] to-[#22D3EE] hover:from-[#67E8FA] hover:to-[#0FBBD6] text-[#06242C] border-b-4 border-[#0B8FA6] shadow-[0_6px_20px_rgba(34,211,238,0.34)]',
  danger:
    'bg-gradient-to-b from-[#FF7585] to-[#FF5B6E] hover:from-[#FF8997] hover:to-[#E84559] text-white border-b-4 border-[#B8283A] shadow-[0_6px_20px_rgba(255,91,110,0.34)]',
  secondary:
    'bg-[#222E52] hover:bg-[#2A3966] text-white border border-[#AEBBD9]/25 border-b-4 border-b-[#131B36]',
};

const SIZE_CLASSES = {
  sm: 'px-3.5 py-2 text-xs sm:text-sm rounded-xl gap-1.5',
  md: 'px-5 py-2.5 text-sm sm:text-base rounded-2xl gap-2',
  lg: 'px-6 py-3.5 text-base sm:text-lg rounded-2xl gap-2.5',
  xl: 'px-7 py-4 text-lg sm:text-xl rounded-2xl gap-3',
};

export const GameButton: React.FC<GameButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  onClick,
  disabled,
  children,
  type = 'button',
  ...rest
}) => {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.97, y: 1 }}
      onClick={(e) => {
        if (!disabled) {
          audioService.playClick();
          onClick?.(e);
        }
      }}
      className={`glossy-btn inline-flex items-center justify-center font-display font-bold tracking-wide transition-colors cursor-pointer select-none whitespace-nowrap shrink-0 disabled:opacity-45 disabled:cursor-not-allowed ${
        VARIANT_CLASSES[variant]
      } ${SIZE_CLASSES[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...(rest as Record<string, unknown>)}
    >
      {children}
    </motion.button>
  );
};
