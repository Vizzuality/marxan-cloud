import React from 'react';

import cx from 'classnames';

import { motion, AnimatePresence } from 'framer-motion';

import { LoadingMoreProps } from './types';

export const LoadingMore: React.FC<LoadingMoreProps> = ({ visible = false }: LoadingMoreProps) => {
  return (
    <AnimatePresence>
      <motion.div
        key="loading"
        className={cx({
          'opacity-100': visible,
          'opacity-0': !visible,
          'pointer-events-none absolute bottom-0 left-0 z-20 w-full bg-gray-100 text-center font-heading text-xs uppercase transition':
            true,
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
