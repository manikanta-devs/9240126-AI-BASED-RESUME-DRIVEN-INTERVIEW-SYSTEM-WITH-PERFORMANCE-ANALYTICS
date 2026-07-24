import React from 'react';
import { motion } from 'framer-motion';

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div
      className={`rounded-full border-2 border-indigo-600 border-t-transparent animate-spin ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

export const FullPageLoader = ({ text = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0e1a]">
      <motion.div
        className="relative flex items-center justify-center w-24 h-24 mb-8"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Hexagon SVG Background */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full text-indigo-500/20"
          fill="currentColor"
        >
          <polygon points="50 3, 93 25, 93 75, 50 97, 7 75, 7 25" />
        </svg>
        {/* Hexagon SVG Border */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full text-indigo-500 drop-shadow-[0_0_12px_rgba(99,102,241,0.6)]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polygon points="50 3, 93 25, 93 75, 50 97, 7 75, 7 25" />
        </svg>
        <span className="relative text-2xl font-bold tracking-widest text-indigo-400 font-sans">
          TF
        </span>
      </motion.div>

      <div className="flex space-x-3 mb-6">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-2.5 h-2.5 rounded-full bg-indigo-500"
            animate={{
              y: ["0%", "-60%", "0%"],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.15,
            }}
          />
        ))}
      </div>

      <motion.p
        className="text-slate-400 font-medium tracking-wider text-sm uppercase"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {text}
      </motion.p>
    </div>
  );
};

export const SkeletonLoader = ({ variant = 'text', className = '' }) => {
  const variantClasses = {
    text: 'h-4 w-full rounded',
    card: 'h-48 w-full rounded-xl',
    avatar: 'h-12 w-12 rounded-full',
    button: 'h-10 w-32 rounded-lg',
  };

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
      <div
        className={`relative overflow-hidden ${variantClasses[variant]} ${className}`}
        style={{ backgroundColor: '#1e293b' }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
            animation: 'shimmer 2s infinite linear',
          }}
        />
      </div>
    </>
  );
};

export const PageTransition = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default LoadingSpinner;
