import React from 'react';
import { VisualObjectType } from '../types/game';

interface MathObjectIconProps {
  type: VisualObjectType;
  size?: number;
  className?: string;
}

export const MathObjectIcon: React.FC<MathObjectIconProps> = ({
  type,
  size = 44,
  className = '',
}) => {
  switch (type) {
    case 'apple':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
          <path d="M32 15 C32 9, 37 6, 40 7" stroke="#6B4423" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M34 12 C42 6, 50 11, 44 18 C39 20, 35 16, 34 12 Z" fill="#35D66F" />
          <path
            d="M32 18 C20 14, 10 24, 12 38 C14 52, 24 58, 32 54 C40 58, 50 52, 52 38 C54 24, 44 14, 32 18 Z"
            fill="#FF4757"
            stroke="#C0392B"
            strokeWidth="2.5"
          />
          <ellipse cx="22" cy="29" rx="3.5" ry="6" transform="rotate(-20 22 29)" fill="#FF8B94" opacity="0.7" />
        </svg>
      );

    case 'banana':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
          <path
            d="M14 42 C24 54, 48 48, 54 22 C56 16, 52 12, 48 15 C44 32, 30 38, 16 34 C11 33, 10 38, 14 42 Z"
            fill="#FFD83D"
            stroke="#D99B00"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M50 14 L53 10" stroke="#6B4423" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );

    case 'star':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
          <path
            d="M32 7 L39.5 22.5 L56.5 25 L44 37 L47 54 L32 46 L17 54 L20 37 L7.5 25 L24.5 22.5 Z"
            fill="#FFD83D"
            stroke="#E69D00"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <circle cx="27" cy="30" r="2" fill="#78350F" />
          <circle cx="37" cy="30" r="2" fill="#78350F" />
          <path d="M28 36 Q32 40 36 36" stroke="#78350F" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
      );

    case 'duck':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
          <ellipse cx="32" cy="41" rx="19" ry="14" fill="#FFD83D" stroke="#D99B00" strokeWidth="2.5" />
          <circle cx="24" cy="23" r="11" fill="#FFD83D" stroke="#D99B00" strokeWidth="2.5" />
          <path d="M13 24 L6 26 L13 29 Z" fill="#FF963C" stroke="#C25E00" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="21" cy="21" r="2.2" fill="#1E293B" />
          <path d="M29 38 C36 35, 42 40, 39 45 C34 48, 28 44, 29 38 Z" fill="#FFE875" stroke="#D99B00" strokeWidth="2" />
        </svg>
      );

    case 'candy':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
          <path d="M14 22 L6 16 L8 28 L4 34 L14 34 Z" fill="#FF55AE" stroke="#BE185D" strokeWidth="2" strokeLinejoin="round" />
          <path d="M50 30 L58 24 L56 36 L60 42 L50 42 Z" fill="#FF55AE" stroke="#BE185D" strokeWidth="2" strokeLinejoin="round" />
          <rect x="15" y="18" width="34" height="26" rx="13" transform="rotate(-12 32 31)" fill="#FF55AE" stroke="#BE185D" strokeWidth="2.5" />
          <path d="M24 22 L28 41 M36 20 L40 39" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.85" />
        </svg>
      );

    case 'car':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
          <path d="M14 34 L20 20 H42 L50 34 Z" fill="#60A5FA" stroke="#1D4ED8" strokeWidth="2.5" strokeLinejoin="round" />
          <rect x="8" y="32" width="48" height="15" rx="6" fill="#287BFF" stroke="#1D4ED8" strokeWidth="2.5" />
          <rect x="21" y="23" width="10" height="8" rx="2" fill="#E0F2FE" />
          <rect x="33" y="23" width="10" height="8" rx="2" fill="#E0F2FE" />
          <circle cx="19" cy="48" r="6" fill="#1E293B" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="45" cy="48" r="6" fill="#1E293B" stroke="#FFFFFF" strokeWidth="2" />
        </svg>
      );

    case 'balloon':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
          <path d="M32 45 Q29 52 34 58" stroke="#64748B" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <ellipse cx="32" cy="26" rx="16" ry="19" fill="#9755F5" stroke="#6D28D9" strokeWidth="2.5" />
          <path d="M29 45 L35 45 L32 41 Z" fill="#9755F5" stroke="#6D28D9" strokeWidth="1.5" />
          <ellipse cx="25" cy="19" rx="3.5" ry="6" transform="rotate(-18 25 19)" fill="#FFFFFF" opacity="0.45" />
        </svg>
      );
  }
};

export const GardenArtwork: React.FC<{ kind: string; size?: number }> = ({ kind, size = 64 }) => {
  switch (kind) {
    case 'sunflower':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
          <path d="M32 34 V58" stroke="#22C55E" strokeWidth="5" strokeLinecap="round" />
          <path d="M32 46 C22 42, 20 48, 28 52" fill="#35D66F" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <ellipse
              key={deg}
              cx="32"
              cy="12"
              rx="5"
              ry="9"
              fill="#FFD83D"
              stroke="#EAB308"
              strokeWidth="1.5"
              transform={`rotate(${deg} 32 24)`}
            />
          ))}
          <circle cx="32" cy="24" r="9" fill="#78350F" />
        </svg>
      );
    case 'tulip':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
          <path d="M32 34 V58" stroke="#22C55E" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M20 22 C20 36, 44 36, 44 22 L38 14 L32 22 L26 14 Z" fill="#FF55AE" stroke="#DB2777" strokeWidth="2" />
        </svg>
      );
    case 'butterfly':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
          <ellipse cx="22" cy="26" rx="11" ry="13" fill="#FF963C" stroke="#EA580C" strokeWidth="2" />
          <ellipse cx="42" cy="26" rx="11" ry="13" fill="#FF963C" stroke="#EA580C" strokeWidth="2" />
          <ellipse cx="24" cy="40" rx="8" ry="9" fill="#FFD83D" stroke="#EA580C" strokeWidth="2" />
          <ellipse cx="40" cy="40" rx="8" ry="9" fill="#FFD83D" stroke="#EA580C" strokeWidth="2" />
          <rect x="29" y="20" width="6" height="26" rx="3" fill="#334155" />
        </svg>
      );
    case 'apple_tree':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
          <rect x="27" y="38" width="10" height="20" rx="3" fill="#854D0E" />
          <circle cx="32" cy="26" r="18" fill="#35D66F" stroke="#16A34A" strokeWidth="2.5" />
          <circle cx="24" cy="24" r="3.5" fill="#FF4757" />
          <circle cx="38" cy="20" r="3.5" fill="#FF4757" />
          <circle cx="34" cy="31" r="3.5" fill="#FF4757" />
        </svg>
      );
    case 'pine_tree':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
          <rect x="28" y="44" width="8" height="14" rx="2" fill="#78350F" />
          <polygon points="32,8 14,34 50,34" fill="#22C55E" />
          <polygon points="32,20 11,46 53,46" fill="#16A34A" />
        </svg>
      );
    case 'mushroom_house':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
          <rect x="20" y="34" width="24" height="22" rx="4" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
          <path d="M12 36 C12 16, 52 16, 52 36 Z" fill="#FF55AE" stroke="#BE185D" strokeWidth="2" />
          <circle cx="25" cy="26" r="3.5" fill="#FFFFFF" />
          <circle cx="38" cy="24" r="3" fill="#FFFFFF" />
          <rect x="28" y="42" width="8" height="14" rx="4" fill="#92400E" />
        </svg>
      );
    case 'rainbow_arch':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
          <path d="M10 46 A22 22 0 0 1 54 46" stroke="#FF55AE" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M15 46 A17 17 0 0 1 49 46" stroke="#FFD83D" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M20 46 A12 12 0 0 1 44 46" stroke="#287BFF" strokeWidth="5" fill="none" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
          <ellipse cx="32" cy="48" rx="22" ry="8" fill="#60A5FA" stroke="#2563EB" strokeWidth="2" />
          <rect x="27" y="28" width="10" height="20" fill="#E2E8F0" />
          <path d="M32 24 C22 14, 16 26, 20 34 M32 24 C42 14, 48 26, 44 34" stroke="#93C5FD" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="32" cy="14" r="4" fill="#FFD83D" />
        </svg>
      );
  }
};
