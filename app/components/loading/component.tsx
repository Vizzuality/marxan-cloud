import React from 'react';

import { motion, AnimatePresence } from 'framer-motion';

import Icon from 'components/icon';
import { cn } from 'utils/cn';

import LOADING_SVG from 'svgs/ui/processing.svg?sprite';

import { LoadingProps } from './types';

export const Loading: React.FC<LoadingProps> = ({
  visible = false,
  className = 'absolute',
  iconClassName = 'w-5 h-5',
  transition = {},
}: LoadingProps) => {
  const variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loading"
          {...variants}
          transition={transition}
          className={cn({
            [className]: !!className,
          })}
        >
          <Icon icon={LOADING_SVG} className={iconClassName} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loading;
