import React, { useMemo } from 'react';

import { useRouter } from 'next/router';

import { motion } from 'framer-motion';

import { useScenarioStatus } from 'hooks/scenarios';

export interface ScenarioStatusProps {
}

export const ScenarioStatus: React.FC<ScenarioStatusProps> = () => {
  const { query } = useRouter();
  const { pid, sid } = query;

  const { data } = useScenarioStatus(pid, sid);
  console.log(data);

  const runJob = useMemo(() => {
    const { jobs = [] } = data || {};
    return jobs.find((j) => j.status === 'running');
  }, [data]);

  if (runJob) {
    console.info(runJob);
  }

  return (
    <div className="absolute top-0 left-0 z-50 flex flex-col justify-end w-full h-full pointer-events-none">
      {runJob && (
        <motion.div
          className="absolute top-0 left-0 z-10 w-full h-full pointer-events-auto bg-blur"
          key="status-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}

      {runJob && (
        <motion.div
          className="absolute z-10 pointer-events-auto top-1/2 left-1/2"
          key="status-text"
          initial={{ opacity: 0, y: '-60%', x: '-50%' }}
          animate={{ opacity: 1, y: '-50%', x: '-50%' }}
        >
          <div className="w-full max-w-xs p-10 bg-gray-500">
            The scenario is processing XXX
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ScenarioStatus;
