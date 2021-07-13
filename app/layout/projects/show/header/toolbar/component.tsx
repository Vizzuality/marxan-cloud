import React from 'react';

import { useProject } from 'hooks/projects';
import { useRouter } from 'next/router';

import { AnimatePresence, motion } from 'framer-motion';

import Button from 'components/button';
import Icon from 'components/icon';

import HelpBeacon from 'layout/help/beacon';

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
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
        >
          <div className="flex space-x-4">
            <HelpBeacon
              id="project-upload"
              title="Upload scenario"
              subtitle="Project list"
              content={(
                <div>
                  You can upload the files of a marxan scenario directly.
                  You will need to compress your input files
                  as a zipfile. Make sure that your planning region and grid match the one used
                  for all the scenarios is this project.
                </div>
              )}
            >
              <div>
                <Button
                  id="scenarios-upload"
                  theme="secondary"
                  size="base"
                >
                  <span className="mr-2.5">Upload new Scenario</span>
                  <Icon icon={UPLOAD_SVG} />
                </Button>
              </div>
            </HelpBeacon>

            <HelpBeacon
              id="project-download"
              title="Download scenario"
              subtitle="Project list"
              content={(
                <div>
                  You can download all the files from any of your projects in the standard marxan
                  format.This may be helpful if you need to prepare your files with more specific
                  spatial operations.After doing so you can upload your files back into the
                  platform to continue with the analysis

                </div>
              )}
            >
              <div>
                <Button
                  id="scenarios-download"
                  theme="secondary"
                  size="base"
                >
                  <span className="mr-2.5">Download project</span>
                  <Icon icon={DOWNLOAD_SVG} />
                </Button>
              </div>
            </HelpBeacon>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toolbar;
