import React from 'react';

import { useNProgress } from '@tanem/react-nprogress';
import { AnimatePresence, motion } from 'framer-motion';

import { cn } from 'utils/cn';

export interface LoadingProps {
  loading?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({ loading }: LoadingProps) => {
  const { isFinished, progress } = useNProgress({
    isAnimating: loading,
  });

  return (
    <AnimatePresence>
      {!isFinished && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn({
            'fixed z-50 h-full w-full': true,
          })}
        >
          <div
            className={cn({
              'absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-purple-600 to-blue-600 transition-transform':
                true,
            })}
            style={{
              transform: `translateX(${-100 + progress * 100}%)`,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loading;
