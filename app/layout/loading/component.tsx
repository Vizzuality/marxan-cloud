import React from 'react';

import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';

export interface LoadingProps {
  loading?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({ loading }: LoadingProps) => {
  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cx({
            'fixed z-50 w-full h-full bg-black': true,
          })}
        >
          Loading
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loading;
