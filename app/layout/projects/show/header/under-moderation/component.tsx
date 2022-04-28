import React from 'react';

import { useRouter } from 'next/router';

import { AnimatePresence, motion } from 'framer-motion';

import { useProject } from 'hooks/projects';

import Icon from 'components/icon';
import Tooltip from 'components/tooltip';

import UNDER_MODERATION_SVG from 'svgs/ui/under-moderation.svg?sprite';

export interface UnderModerationProps {
}

export const UnderModeration: React.FC<UnderModerationProps> = () => {
  const { query } = useRouter();
  const { pid } = query;

  const { data: projectData } = useProject(pid);

  const { publicMetadata } = projectData;

  return (
    <AnimatePresence
      exitBeforeEnter
    >
      {publicMetadata?.underModeration && (
        <Tooltip
          placement="bottom-start"
          arrow
          maxWidth={350}
          content={(
            <div
              className="p-4 space-y-2 text-sm text-gray-500 bg-white rounded"
              style={{
                boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
              }}
            >
              <p>Your published project is under moderation. An admin will contact you soon.</p>
              <p>
                During this time you project will be removed
                from the list of published projects until resolution
              </p>
            </div>
          )}
        >
          <motion.div
            key="under-moderation"
            className="inline-flex items-center justify-start space-x-2.5 bg-red-500 py-2 px-2.5 rounded-lg"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
          >
            <div className="flex items-center justify-center w-5 h-5 border border-white rounded-full">
              <Icon className="w-4 h-4 text-white stroke-current" icon={UNDER_MODERATION_SVG} />
            </div>
            <span className="text-sm">Your published project is under moderation</span>
          </motion.div>
        </Tooltip>
      )}
    </AnimatePresence>
  );
};

export default UnderModeration;
