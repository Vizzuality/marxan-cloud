import React from 'react';

import { useRouter } from 'next/router';

import { AnimatePresence, motion } from 'framer-motion';
import { usePlausible } from 'next-plausible';

import { useMe } from 'hooks/me';
import { useProject } from 'hooks/projects';

import HelpBeacon from 'layout/help/beacon';
import ComingSoon from 'layout/help/coming-soon';
import PublishProjectButton from 'layout/projects/show/header/toolbar/publish-btn';

import Button from 'components/button';
import Icon from 'components/icon';

import DOWNLOAD_SVG from 'svgs/ui/download.svg?sprite';

export interface ToolbarProps {
}

export const Toolbar: React.FC<ToolbarProps> = () => {
  const { query } = useRouter();
  const { pid } = query;
  const plausible = usePlausible();

  const { data: projectData } = useProject(pid);
  const { user } = useMe();

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

            <HelpBeacon
              id="project-download"
              title="Download scenario"
              subtitle=""
              content={(
                <div>
                  You can download all the files from your project in the standard Marxan
                  format. This will allow you to edit your project outside of the Marxan
                  Cloud platform.
                  After doing so you can continue working inside Marxan Cloud by
                  re-uploading your files back into the platform.

                </div>
              )}
            >
              <div>
                <ComingSoon>
                  <Button
                    theme="secondary"
                    size="base"
                    onClick={() => plausible('Download project', {
                      props: {
                        userId: `${user.id}`,
                        userEmail: `${user.email}`,
                        projectId: `${pid}`,
                        projectName: `${projectData.name}`,
                      },
                    })}
                  >
                    <span className="mr-2.5">Download project</span>
                    <Icon icon={DOWNLOAD_SVG} />
                  </Button>
                </ComingSoon>
              </div>
            </HelpBeacon>

          </div>
        </motion.div>
      )}

    </AnimatePresence>
  );
};

export default Toolbar;
