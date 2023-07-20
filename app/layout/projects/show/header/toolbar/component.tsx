import React from 'react';

import { useRouter } from 'next/router';

import { AnimatePresence, motion } from 'framer-motion';

import { useProject } from 'hooks/projects';

import DownloadProjectButton from 'layout/projects/show/header/toolbar/download-btn';
import PublishProjectButton from 'layout/projects/show/header/toolbar/publish-btn';

export interface ToolbarProps {}

export const Toolbar: React.FC<ToolbarProps> = () => {
  const { query } = useRouter();
  const { pid } = query as { pid: string };

  const { data: projectData } = useProject(pid);

  return (
    <AnimatePresence>
      {projectData?.name && (
        <motion.div
          key="project-toolbar"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
        >
          <div className="flex space-x-4">
            <PublishProjectButton />
            <DownloadProjectButton />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toolbar;
