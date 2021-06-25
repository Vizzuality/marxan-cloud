import React, { useState, useCallback } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import Button from 'components/button';

import Pill from 'layout/pill';

import Sections from 'layout/scenarios/sidebar/solutions/sections';
import SolutionsDetails from 'layout/scenarios/sidebar/solutions/details';
import SolutionsGapAnalysis from 'layout/scenarios/sidebar/solutions/gap-analysis';
import SolutionsList from 'layout/scenarios/sidebar/solutions/list';
import { ScenarioSidebarTabs } from 'layout/scenarios/sidebar/types';

import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { useScenario } from 'hooks/scenarios';
import { ScenariosSidebarSolutionsProps } from './types';
import { SolutionsSections } from './sections/types';

export const ScenariosSidebarSolutions: React.FC<ScenariosSidebarSolutionsProps> = () => {
  const [section, setSection] = useState(null);
  const { query } = useRouter();
  const { sid } = query;

  const { tab } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const { data: scenarioData } = useScenario(sid);

  // CALLBACKS
  const onChangeSection = useCallback((s) => {
    setSection(s);
  }, []);

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

          {!section && (
            <Sections
              key="sections"
              onChangeSection={onChangeSection}
            />
          )}

          {section === SolutionsSections.DETAILS && (
            <SolutionsDetails
              key={SolutionsSections.DETAILS}
              onChangeSection={onChangeSection}
              onScheduleScenario={() => console.info('Schedule scenario - solutions')}
              onViewSolutionsTable={() => console.info('View solutions table - solutions')}
              numberOfSchedules={2}
            />
          )}

          {section === SolutionsSections.GAP_ANALYSIS && (
            <SolutionsGapAnalysis
              key={SolutionsSections.GAP_ANALYSIS}
              onChangeSection={onChangeSection}
            />
          )}

          {section === SolutionsSections.SOLUTIONS && (
            <SolutionsList
              key={SolutionsSections.SOLUTIONS}
              onChangeSection={onChangeSection}
            />
          )}

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
              onClick={() => console.info('Re-Run scenario - solutions')}
            >
              Re-Run scenario
            </Button>
            <Button
              className="ml-4"
              theme="primary"
              size="lg"
              onClick={() => console.info('Save scenario - solutions')}
            >
              Save Scenario
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ScenariosSidebarSolutions;
