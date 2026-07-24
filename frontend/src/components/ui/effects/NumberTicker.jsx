import React from 'react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { twMerge } from 'tailwind-merge';

export default function NumberTicker({
  value,
  prefix = '',
  suffix = '',
  duration = 2,
  decimals = 0,
  className,
}) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div ref={ref} className={twMerge("inline-block font-bold text-slate-100", className)}>
      {inView ? (
        <CountUp
          start={0}
          end={value}
          duration={duration}
          decimals={decimals}
          prefix={prefix}
          suffix={suffix}
          useEasing={true}
        />
      ) : (
        <span>{prefix}0{suffix}</span>
      )}
    </div>
  );
}
