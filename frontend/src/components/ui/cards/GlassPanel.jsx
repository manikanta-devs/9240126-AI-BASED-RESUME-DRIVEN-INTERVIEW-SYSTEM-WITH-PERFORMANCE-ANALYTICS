import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function GlassPanel({
  children,
  className,
  blur = 12,
  opacity = 0.6,
  borderColor = 'rgba(255,255,255,0.08)',
  glow = false,
  ...props
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        "relative rounded-2xl overflow-hidden transition-shadow duration-300",
        glow && "hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)]",
        className
      )}
      style={{
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        backgroundColor: `rgba(255, 255, 255, ${opacity})`,
        border: `1px solid ${borderColor}`,
      }}
      {...props}
    >
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </motion.div>
  );
}
