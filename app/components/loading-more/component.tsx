import React from 'react';
import cx from 'classnames';

import { motion, AnimatePresence } from 'framer-motion';

import { LoadingMoreProps } from './types';

export const LoadingMore: React.FC<LoadingMoreProps> = ({
  visible = false,
}: LoadingMoreProps) => {
  const variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <AnimatePresence>
      <motion.div
        key="loading"
        {...variants}
        className={cx({
          'opacity-100': visible,
          'absolute left-0 z-20 w-full text-xs text-center uppercase bottom-0 font-heading transition opacity-0 pointer-events-none': true,
        })}
      >
        <div className="py-1 bg-gray-700">Loading more...</div>
        <div className="w-full h-6 bg-gray-700" />
      </motion.div>
    </AnimatePresence>
  );
};

export default LoadingMore;
