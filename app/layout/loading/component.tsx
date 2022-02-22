import React from 'react';

import { useNProgress } from '@tanem/react-nprogress';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';

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
          className={cx({
            'fixed z-50 w-full h-full': true,
          })}
        >
          <div
            className={cx({
              'absolute top-0 left-0 h-1 transition-transform bg-gradient-to-r from-purple-500 to-blue-500 w-full': true,
            })}
            style={{
              transform: `translateX(${-100 + (progress * 100)}%)`,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loading;
