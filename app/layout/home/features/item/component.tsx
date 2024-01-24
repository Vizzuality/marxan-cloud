import React from 'react';

import { useInView } from 'react-intersection-observer';

import { motion } from 'framer-motion';

import Icon from 'components/icon';

export interface HomeFeaturesItemProps {
  id: string;
  name: string;
  description: string;
  index: number;
  icon: {
    id: string;
    viewBox: string;
  };
}

export const HomeFeaturesItem: React.FC<HomeFeaturesItemProps> = ({
  id,
  name,
  description,
  icon,
  index,
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
        delay: (index % 3) * 0.1,
        ease: 'easeInOut',
      }}
    >
      <div key={`${id}`}>
        <Icon icon={icon} className="h-16 w-16" />
        <h2 className="mb-2.5 mt-2.5 font-heading text-2xl font-medium text-gray-900 md:mb-10 md:mt-6">
          {name}
        </h2>
        <p className="text-gray-600">{description}</p>
      </div>
    </motion.div>
  );
};

export default HomeFeaturesItem;
