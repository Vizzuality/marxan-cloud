import React from 'react';

import cx from 'classnames';
import { motion, AnimatePresence } from 'framer-motion';

import { LoadingMoreProps } from './types';

export const LoadingMore: React.FC<LoadingMoreProps> = ({
  visible = false,
}: LoadingMoreProps) => {
  return (
    <AnimatePresence>
      <motion.div
        key="loading"
        className={cx({
          'opacity-100': visible,
          'opacity-0': !visible,
          'absolute left-0 z-20 w-full text-xs text-center uppercase bottom-0 font-heading transition pointer-events-none bg-gray-400': true,
        })}
        transition={{
          duration: 100,
        }}
      >
        <div className="py-1 text-white">Loading more...</div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoadingMore;
