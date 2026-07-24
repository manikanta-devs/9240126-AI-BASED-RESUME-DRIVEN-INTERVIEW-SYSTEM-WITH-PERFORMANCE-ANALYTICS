import React from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

export default function TextReveal({
  text,
  speed = 50,
  delay = 0,
  cursor = true,
  className,
}) {
  const letters = Array.from(text);
  
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: speed / 1000, delayChildren: delay },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 200,
      },
    },
    hidden: {
      opacity: 0,
      y: 10,
    },
  };

  return (
    <motion.span
      className={twMerge("inline-flex flex-wrap items-center", className)}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {letters.map((letter, index) => (
        <motion.span variants={child} key={index} className="inline-block">
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
      {cursor && (
        <motion.span
          className="inline-block w-[2px] h-[1em] bg-current ml-1"
          animate={{ opacity: [1, 0] }}
          transition={{
            repeat: Infinity,
            duration: 0.8,
            ease: "linear"
          }}
        />
      )}
    </motion.span>
  );
}
