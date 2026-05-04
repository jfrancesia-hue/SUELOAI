'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type BlurTextProps = {
  text: string;
  className?: string;
  as?: 'h1' | 'p';
};

export function BlurText({ text, className, as: Tag = 'p' }: BlurTextProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const reduceMotion = useReducedMotion();
  const words = text.split(' ');

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={(node) => { ref.current = node; }} className={className}>
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <motion.span
            initial={{ filter: 'blur(10px)', opacity: 0, y: reduceMotion ? 0 : 50 }}
            animate={
              visible
                ? {
                    filter: reduceMotion ? 'blur(0px)' : ['blur(10px)', 'blur(5px)', 'blur(0px)'],
                    opacity: reduceMotion ? 1 : [0, 0.5, 1],
                    y: reduceMotion ? 0 : [50, -5, 0],
                  }
                : undefined
            }
            transition={{
              duration: reduceMotion ? 0.01 : 0.7,
              times: [0, 0.5, 1],
              ease: 'easeOut',
              delay: reduceMotion ? 0 : (index * 100) / 1000,
            }}
            style={{ display: 'inline-block', marginRight: '0.28em' }}
          >
            {word}
          </motion.span>
          {index < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </Tag>
  );
}
