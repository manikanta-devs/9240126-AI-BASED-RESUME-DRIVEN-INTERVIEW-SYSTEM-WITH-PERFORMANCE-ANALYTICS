import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function ShimmerButton({ 
  children, 
  className, 
  onClick, 
  shimmerColor = '#ffffff', 
  size = 'md',
  ...props
}) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      onClick={onClick}
      className={twMerge(
        "group relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-800 font-semibold text-white shadow-lg transition-all hover:scale-105 active:scale-95",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] animate-shimmer">
        <div
          className="relative h-full w-12"
          style={{ background: `linear-gradient(90deg, transparent, ${shimmerColor}40, transparent)` }}
        />
      </div>
      <span className="relative z-10">{children}</span>
      <style>{`
        @keyframes shimmer {
          0% { transform: skew(-12deg) translateX(-150%); }
          100% { transform: skew(-12deg) translateX(150%); }
        }
        .animate-shimmer {
          animation: shimmer 2.5s infinite;
        }
      `}</style>
    </button>
  );
}
