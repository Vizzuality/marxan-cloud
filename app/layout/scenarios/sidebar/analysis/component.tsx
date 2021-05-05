import React from 'react';

import { motion } from 'framer-motion';

import Pill from 'layout/pill';

import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { useScenario } from 'hooks/scenarios';

export interface ScenariosSidebarAnalysisProps {
}

export const ScenariosSidebarAnalysis: React.FC<ScenariosSidebarAnalysisProps> = () => {
  const { query } = useRouter();
  const { sid } = query;

  const { tab } = useSelector((state) => state[`/scenarios/${sid}`]);

  const { data: scenarioData } = useScenario(sid);

  if (!scenarioData || tab !== 'analysis') return null;

  return (
    <motion.div
      key="analysis"
      className="flex flex-col min-h-0 overflow-hidden"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Pill selected>
        <header className="flex justify-between flex-shrink-0">
          <div>
            <div className="flex items-baseline space-x-4">
              <h2 className="text-lg font-medium font-heading">Analysis</h2>
            </div>
          </div>
        </header>
      </Pill>
    </motion.div>
  );
};

export default ScenariosSidebarAnalysis;
