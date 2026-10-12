import React, { useState } from 'react';

interface VisualImageProps {
  src?: string;
  alt: string;
  fallbackEmoji?: string;
  className?: string;
  containerClassName?: string;
}

export const VisualImage: React.FC<VisualImageProps> = ({
  src,
  alt,
  fallbackEmoji = '📖',
  className = 'w-full h-full object-cover',
  containerClassName = 'w-full h-full relative overflow-hidden bg-slate-100 flex items-center justify-center',
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={containerClassName}>
      {/* Skeleton loading indicator */}
      {!loaded && !error && src && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-amber-50 to-slate-100 animate-pulse flex items-center justify-center">
          <span className="text-3xl opacity-40 animate-bounce">{fallbackEmoji}</span>
        </div>
      )}

      {/* Main Image */}
      {src && !error ? (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`${className} transition-all duration-300 ${
            loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        />
      ) : (
        /* Fallback graphic with emoji */
        <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-br from-amber-100/70 via-orange-50 to-amber-50 text-center">
          <span className="text-4xl sm:text-5xl drop-shadow-sm select-none animate-in zoom-in-50 duration-200">
            {fallbackEmoji}
          </span>
          <span className="text-[11px] font-extrabold text-amber-800/80 mt-1 uppercase tracking-wider line-clamp-1">
            {alt}
          </span>
        </div>
      )}
    </div>
  );
};
