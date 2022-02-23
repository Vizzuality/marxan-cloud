import React from 'react';

import { useInView } from 'react-intersection-observer';

import { motion } from 'framer-motion';

export interface HomeSupportItemProps {
  id: string,
  text: string,
  image: string,
}

export const HomeSupportItem: React.FC<HomeSupportItemProps> = ({
  id, text, image,
}: HomeSupportItemProps) => {
  const { ref, inView } = useInView({
    threshold: 1,
    triggerOnce: true,
  });

  return (
    <div ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{
          opacity: inView ? 1 : 0,
          y: inView ? 0 : 15,
        }}
        transition={{
          duration: 0.35,
          ease: 'easeInOut',
        }}
      >
        <div key={`${id}`} className="flex items-center space-x-6">
          <img alt={text} className="w-26" src={image} />
          <p className="text-lg text-white">{text}</p>
        </div>
      </motion.div>
    </div>

  );
};

export default HomeSupportItem;
