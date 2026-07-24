import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function AuroraBackground({ children, className }) {
  return (
    <div className={twMerge("relative min-h-screen overflow-hidden bg-[#0a0e1a]", className)}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] opacity-50 mix-blend-screen"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 50%, #6366f1 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 50%),
              radial-gradient(circle at 20% 80%, #06b6d4 0%, transparent 50%)
            `,
            filter: 'blur(80px)',
            animation: 'aurora 20s linear infinite',
          }}
        />
        <style>{`
          @keyframes aurora {
            0% { transform: rotate(0deg) scale(1); }
            33% { transform: rotate(120deg) scale(1.1); }
            66% { transform: rotate(240deg) scale(0.9); }
            100% { transform: rotate(360deg) scale(1); }
          }
        `}</style>
      </div>
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
