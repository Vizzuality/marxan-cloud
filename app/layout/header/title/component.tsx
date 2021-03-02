import React from 'react';

import { useProject } from 'hooks/projects';
import { useScenario } from 'hooks/scenarios';
import { useRouter } from 'next/router';
import { AnimatePresence, motion } from 'framer-motion';

export interface TitleProps {
}

export const Title: React.FC<TitleProps> = () => {
  const { query } = useRouter();
  const { pid, sid } = query;
  const { data: projectData, isLoading: projectIsLoading } = useProject(pid);
  const { data: scenarioData, isLoading: scenarioIsLoading } = useScenario(sid);

  return (
    <AnimatePresence>
      {!projectIsLoading && !scenarioIsLoading && (
        <motion.div
          key="project-scenario-loading"
          className="flex divide-x"
          initial={{ y: -10 }}
          animate={{ y: 0 }}
          exit={{ y: -10 }}
        >
            {projectData?.name && (
              <h1 className="font-medium font-heading px-2.5">{projectData.name}</h1>
            )}

            {scenarioData?.name && (
              <h1 className="font-medium font-heading px-2.5 opacity-50">{scenarioData.name}</h1>
            )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Title;
