import React, { useEffect, useId, useState } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function GridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = "4 2",
  numSquares = 30,
  className,
  maxOpacity = 0.3,
  ...props
}) {
  const id = useId();
  const [squares, setSquares] = useState(() => generateSquares(numSquares));

  function generateSquares(count) {
    return Array.from({ length: count }).map(() => [
      Math.floor(Math.random() * 40),
      Math.floor(Math.random() * 40),
    ]);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setSquares(generateSquares(numSquares));
    }, 4000);
    return () => clearInterval(interval);
  }, [numSquares]);

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-gray-400/30 stroke-gray-400/30",
        className
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
      <svg x={x} y={y} className="overflow-visible">
        {squares.map(([sqX, sqY], idx) => (
          <motion.rect
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, maxOpacity, 0] }}
            transition={{
              duration: Math.random() * 2 + 2,
              repeat: Infinity,
              delay: idx * 0.1,
              ease: "easeInOut",
            }}
            strokeWidth="0"
            key={`${sqX}-${sqY}-${idx}`}
            width={width - 1}
            height={height - 1}
            x={sqX * width + 1}
            y={sqY * height + 1}
          />
        ))}
      </svg>
    </svg>
  );
}
