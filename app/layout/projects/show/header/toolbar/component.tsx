import React from 'react';

import { useProject } from 'hooks/projects';
import { useRouter } from 'next/router';

import { AnimatePresence, motion } from 'framer-motion';

import Button from 'components/button';
import Icon from 'components/icon';

import UPLOAD_SVG from 'svgs/ui/upload.svg?sprite';
import DOWNLOAD_SVG from 'svgs/ui/download.svg?sprite';

export interface ToolbarProps {
}

export const Toolbar: React.FC<ToolbarProps> = () => {
  const { query } = useRouter();
  const { pid } = query;
  const { data } = useProject(pid);

  return (
    <AnimatePresence>
      {data?.name && (
        <motion.div
          key="project-toolbar"
          initial={{ y: -10 }}
          animate={{ y: 0 }}
          exit={{ y: -10 }}
        >
          <div className="flex gap-4">
            <Button
              theme="secondary"
              size="base"
            >
              <span className="mr-2.5">Upload new Scenario</span>
              <Icon icon={UPLOAD_SVG} />
            </Button>

            <Button
              theme="secondary"
              size="base"
            >
              <span className="mr-2.5">Download project</span>
              <Icon icon={DOWNLOAD_SVG} />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toolbar;
