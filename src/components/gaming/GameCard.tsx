import React from 'react';

interface GameCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({
  children,
  className = '',
  glowColor,
  onClick,
  interactive = false,
}) => {
  const interactiveCls =
    interactive || onClick
      ? 'hover:border-[#22D3EE]/45 hover:-translate-y-0.5 transition-all cursor-pointer'
      : '';

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      style={
        glowColor
          ? {
              boxShadow: `0 12px 28px rgba(6, 10, 28, 0.45), 0 0 0 1px ${glowColor}44`,
            }
          : undefined
      }
      className={`gaming-card rounded-[var(--radius-card)] ${interactiveCls} ${className}`}
    >
      {children}
    </div>
  );
};
