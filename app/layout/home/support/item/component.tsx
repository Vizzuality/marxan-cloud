import React from 'react';

import { useInView } from 'react-intersection-observer';

import { AnimatePresence, motion } from 'framer-motion';

export interface HomeSupportItemProps {
  id: string,
  text: string,
  image: string,
}

export const HomeSupportItem: React.FC<HomeSupportItemProps> = ({
  id, text, image,
}: HomeSupportItemProps) => {
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
          <div key={`${id}`} className="flex items-center space-x-6">
            <img alt={text} src={image} />
            <p className="text-lg text-white">{text}</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>

  );
};

export default HomeSupportItem;
