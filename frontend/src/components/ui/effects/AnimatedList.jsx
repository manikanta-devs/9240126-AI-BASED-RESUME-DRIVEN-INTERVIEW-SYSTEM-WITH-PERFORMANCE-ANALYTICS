import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function AnimatedList({
  items = [],
  className,
  staggerDelay = 0.1,
  direction = 'left',
}) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const getDirectionOffset = () => {
    switch (direction) {
      case 'left': return { x: -50, y: 0 };
      case 'right': return { x: 50, y: 0 };
      case 'up': return { x: 0, y: 50 };
      case 'down': return { x: 0, y: -50 };
      default: return { x: -50, y: 0 };
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      ...getDirectionOffset(),
    },
    visible: { 
      opacity: 1, 
      x: 0, 
      y: 0,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 100,
      }
    },
  };

  return (
    <motion.ul
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={cn("flex flex-col gap-4 list-none p-0 m-0", className)}
    >
      {items.map((item, index) => (
        <motion.li key={index} variants={itemVariants}>
          {item}
        </motion.li>
      ))}
    </motion.ul>
  );
}
