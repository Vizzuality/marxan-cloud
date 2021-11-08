import React from 'react';

import { useRouter } from 'next/router';

import { AnimatePresence, motion } from 'framer-motion';

import { useProject } from 'hooks/projects';

export interface TitleProps {
}

export const Title: React.FC<TitleProps> = () => {
  const { query } = useRouter();
  const { pid } = query;
  const { data } = useProject(pid);

  return (
    <AnimatePresence>
      {data?.name && (
        <motion.div
          key="project-name"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
        >
          <h1 className="px-0 py-1 text-4xl font-normal font-heading">{data?.name}</h1>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Title;
