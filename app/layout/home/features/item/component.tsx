import React from 'react';

import { useInView } from 'react-intersection-observer';

import { AnimatePresence, motion } from 'framer-motion';

import Icon from 'components/icon';

export interface HomeFeaturesItemProps {
  id: string,
  name: string,
  description: string,
  icon: {
    id: string,
    viewBox: string,
  }
}

export const HomeFeaturesItem: React.FC<HomeFeaturesItemProps> = ({
  id, name, description, icon,
}: HomeFeaturesItemProps) => {
  const { ref, inView } = useInView({
    threshold: 0.4,
    triggerOnce: true,
  });

  return (
    <div ref={ref}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: inView ? 1 : 0 }}
          transition={{
            duration: 0.35,
            ease: 'easeInOut',
          }}
          exit={{ opacity: 0 }}
        >

          <div key={`${id}`}>
            <Icon icon={icon} className="w-16 h-16" />
            <h2 className="mt-2.5 mb-2.5 md:mt-6 md:mb-10 text-2xl font-medium text-gray-800 font-heading">{name}</h2>
            <p className="text-gray-400">{description}</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>

  );
};

export default HomeFeaturesItem;
