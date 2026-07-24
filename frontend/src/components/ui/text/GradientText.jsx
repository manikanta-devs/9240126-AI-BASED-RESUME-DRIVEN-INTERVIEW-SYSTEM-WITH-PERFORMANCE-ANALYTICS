import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function GradientText({
  children,
  className,
  colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#6366f1'],
  animationSpeed = 4,
}) {
  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${colors.join(', ')})`,
    backgroundSize: '200% auto',
    color: 'transparent',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    animation: `gradient-text-animation ${animationSpeed}s linear infinite`,
  };

  return (
    <>
      <style>
        {`
          @keyframes gradient-text-animation {
            0% { background-position: 0% center; }
            100% { background-position: -200% center; }
          }
        `}
      </style>
      <span className={cn("inline-block", className)} style={gradientStyle}>
        {children}
      </span>
    </>
  );
}
