import React, { useCallback, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { AnimatePresence, motion } from 'framer-motion';
import { ScenarioSidebarTabs, ScenarioSidebarSubTabs } from 'utils/tabs';

import { useScenario } from 'hooks/scenarios';

import HelpBeacon from 'layout/help/beacon';
import Pill from 'layout/pill';
import PostGapAnalysis from 'layout/scenarios/edit/solutions/gap-analysis';
import SolutionsDetails from 'layout/scenarios/edit/solutions/overview';
import ScheduleScenario from 'layout/scenarios/edit/solutions/schedule';
import Sections from 'layout/sections';

import { ScenariosSidebarShowSolutionsProps } from './types';

export const SECTIONS = [
  {
    id: ScenarioSidebarSubTabs.POST_GAP_ANALYSIS,
    name: 'Gap Analysis',
    description: 'This gap analysis shows the amount of each feature that would be included if the new conservation plan your are working on is implemented.',
  },
  {
    id: ScenarioSidebarSubTabs.SCHEDULE_SCENARIO,
    name: 'Schedule scenario',
    description: 'Comming feature...',
    disabled: true,
  },
];

export const ScenariosSidebarShowSolutions: React.FC<ScenariosSidebarShowSolutionsProps> = () => {
  const { query } = useRouter();
  const { sid } = query;

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setSubTab } = scenarioSlice.actions;

  const { tab, subtab } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const dispatch = useDispatch();

  const { data: scenarioData } = useScenario(sid);

  // CALLBACKS
  const onChangeSection = useCallback((s) => {
    const sub = s || null;
    dispatch(setSubTab(sub));
  }, [dispatch, setSubTab]);

  // EFFECTS
  useEffect(() => {
    if (!SECTIONS.find((s) => s.id === subtab)) {
      dispatch(setSubTab(null));
    }
  }, []); // eslint-disable-line

  if (!scenarioData || tab !== ScenarioSidebarTabs.SOLUTIONS) return null;

  return (
    <div className="flex flex-col flex-grow w-full h-full overflow-hidden">
      <HelpBeacon
        id="scenarios-solutions"
        title="Solutions"
        subtitle="View the results"
        content={(
          <div className="space-y-2">
            <p>
              Under
              {' '}
              <b>Solution Overview</b>
              {' '}
              you will find the information
              for each of the
              individual solutions as a table.
              You can see all solutions or you can
              filter to see only
              the 5 most different ones.
              You can select here which solution to view on the map and download the results.
            </p>
            <p>
              Under
              {' '}
              <b>Gap Analysis</b>
              {' '}
              you can see
              how much your conservation network would improve
              the current conservation of your features.
            </p>

          </div>
        )}
        modifiers={['flip']}
        tooltipPlacement="left"
      >
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

              {!subtab && (
                <SolutionsDetails
                  key="solutions-overview"
                />
              )}

              {!subtab && (
                <Sections
                  key="sections"
                  sections={SECTIONS}
                  onChangeSection={onChangeSection}
                />
              )}

              {subtab === ScenarioSidebarSubTabs.SCHEDULE_SCENARIO && (
                <ScheduleScenario
                  key="schedule-scenario"
                  onChangeSection={onChangeSection}
                  onScheduleScenario={() => console.info('Schedule scenario - solutions')}
                  numberOfSchedules={2}
                />
              )}

              {subtab === ScenarioSidebarSubTabs.POST_GAP_ANALYSIS && (
                <PostGapAnalysis
                  key="post-gap-analysis"
                  onChangeSection={onChangeSection}
                />
              )}
            </Pill>

          </AnimatePresence>
        </motion.div>
      </HelpBeacon>
    </div>
  );
};

export default ScenariosSidebarShowSolutions;
