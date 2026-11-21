import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
  fallbackBg?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  fallbackLabel,
  fallbackBg = '#EEF5FF',
}) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-2xl border border-slate-200 text-slate-600 ${className}`}
        style={{ backgroundColor: fallbackBg }}
        role="img"
        aria-label={alt}
      >
        <Sparkles className="w-8 h-8 text-[#287BFF] mb-1" />
        {fallbackLabel && (
          <span className="text-xs font-semibold px-2 text-center">{fallbackLabel}</span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
