import React, { useCallback, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import Pill from 'layout/pill';
import Sections from 'layout/scenarios/sidebar/analysis/sections';
import GapAnalysis from 'layout/scenarios/sidebar/analysis/gap-analysis';
import CostSurface from 'layout/scenarios/sidebar/analysis/cost-surface';
import AdjustPanningUnits from 'layout/scenarios/sidebar/analysis/adjust-planning-units';

import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { useScenario } from 'hooks/scenarios';

export interface ScenariosSidebarAnalysisProps {
}

export const ScenariosSidebarAnalysis: React.FC<ScenariosSidebarAnalysisProps> = () => {
  const [section, setSection] = useState(null);
  const { query } = useRouter();
  const { sid } = query;

  const { tab } = useSelector((state) => state[`/scenarios/${sid}`]);

  const { data: scenarioData } = useScenario(sid);

  // CALLBACKS
  const onChangeSection = useCallback((s) => {
    setSection(s);
  }, []);

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

        <AnimatePresence exitBeforeEnter>
          {!section && (
            <Sections
              key="sections"
              onChangeSection={onChangeSection}
            />
          )}

          {section === 'gap-analysis' && (
            <GapAnalysis
              key="gap-analysis"
              onChangeSection={onChangeSection}
            />
          )}

          {section === 'cost-surface' && (
            <CostSurface
              key="cost-surface"
              onChangeSection={onChangeSection}
            />
          )}

          {section === 'adjust-planning-units' && (
            <AdjustPanningUnits
              key="adjust-planning-units"
              onChangeSection={onChangeSection}
            />
          )}
        </AnimatePresence>
      </Pill>
    </motion.div>
  );
};

export default ScenariosSidebarAnalysis;
