import React from 'react';

import { useInView } from 'react-intersection-observer';

import { motion } from 'framer-motion';

import Icon from 'components/icon';

export interface HomeFeaturesItemProps {
  id: string,
  name: string,
  description: string,
  index: number,
  icon: {
    id: string,
    viewBox: string,
  }
}

export const HomeFeaturesItem: React.FC<HomeFeaturesItemProps> = ({
  id, name, description, icon, index,
}: HomeFeaturesItemProps) => {
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 15 }}
      animate={{
        opacity: inView ? 1 : 0,
        y: inView ? 0 : 15,
      }}
      transition={{
        duration: 0.35,
        delay: index * 0.1,
        ease: 'easeInOut',
      }}
    >
      <div key={`${id}`}>
        <Icon icon={icon} className="w-16 h-16" />
        <h2 className="mt-2.5 mb-2.5 md:mt-6 md:mb-10 text-2xl font-medium text-gray-800 font-heading">{name}</h2>
        <p className="text-gray-400">{description}</p>
      </div>
    </motion.div>
  );
};

export default HomeFeaturesItem;
