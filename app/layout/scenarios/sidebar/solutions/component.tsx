import React from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import Button from 'components/button';

import Pill from 'layout/pill';

// import Sections from 'layout/scenarios/sidebar/analysis/sections';
// import GapAnalysis from 'layout/scenarios/sidebar/analysis/gap-analysis';
// import CostSurface from 'layout/scenarios/sidebar/analysis/cost-surface';
// import AdjustPanningUnits from 'layout/scenarios/sidebar/analysis/adjust-planning-units';
import { ScenarioSidebarTabs } from 'layout/scenarios/sidebar/types';

import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { useScenario } from 'hooks/scenarios';
import { ScenariosSidebarSolutionsProps } from './types';

export const ScenariosSidebarAnalysis: React.FC<ScenariosSidebarSolutionsProps> = () => {
  // const [section, setSection] = useState(null);
  const { query } = useRouter();
  const { sid } = query;

  const { tab } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const { data: scenarioData } = useScenario(sid);

  // CALLBACKS
  // const onChangeSection = useCallback((s) => {
  //   setSection(s);
  // }, []);

  if (!scenarioData || tab !== ScenarioSidebarTabs.SOLUTIONS) return null;

  return (
    <motion.div
      key={ScenarioSidebarTabs.SOLUTIONS}
      className="flex flex-col min-h-0 overflow-hidden"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <AnimatePresence>
        <Pill selected>
          <header className="flex justify-between flex-shrink-0">
            <div>
              <div className="flex items-baseline space-x-4">
                <h2 className="text-lg font-medium font-heading">Solutions</h2>
              </div>
            </div>
          </header>

          {/* {!section && (
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
          )} */}
        </Pill>

        {!section && (
          <motion.div
            key="run-scenario-button"
            className="flex justify-center flex-shrink-0 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Button
              theme="spacial"
              size="lg"
            >
              Re-Run scenario
            </Button>
            <Button
              className="ml-4"
              theme="primary"
              size="lg"
            >
              Save scenario
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ScenariosSidebarAnalysis;
