import React, { useState, useCallback } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioSlice } from 'store/slices/scenarios/detail';

import { AnimatePresence, motion } from 'framer-motion';

import { useScenario } from 'hooks/scenarios';

import HelpBeacon from 'layout/help/beacon';
import Pill from 'layout/pill';
import { ScenarioSidebarTabs } from 'layout/scenarios/show/sidebar/types';
import SolutionsDetails from 'layout/scenarios/show/solutions/details';
import SolutionsGapAnalysis from 'layout/scenarios/show/solutions/gap-analysis';
import Sections from 'layout/sections';

import { ScenariosSidebarShowSolutionsProps } from './types';

export const SECTIONS = [
  {
    id: 'details',
    name: 'Details',
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugit quis quisquam, reiciendis neque, facere perspiciatis.',
  },
  {
    id: 'gap-analysis',
    name: 'Gap Analysis',
    description: 'A gap analysis calculates how much of each feature is under the existing protected area network and then summarises the representation as a percentage.',
  },
];

export const ScenariosSidebarShowSolutions: React.FC<ScenariosSidebarShowSolutionsProps> = () => {
  const [section, setSection] = useState(null);
  const { query } = useRouter();
  const { sid } = query;

  const scenarioSlice = getScenarioSlice(sid);
  const { setSubTab } = scenarioSlice.actions;

  const { tab } = useSelector((state) => state[`/scenarios/${sid}`]);
  const dispatch = useDispatch();

  const { data: scenarioData } = useScenario(sid);

  // CALLBACKS
  const onChangeSection = useCallback((s) => {
    setSection(s);
    const subtab = s ? `solutions-${s}` : 'solutions-preview';
    dispatch(setSubTab(subtab));
  }, [dispatch, setSubTab]);

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
              <b>Details</b>
              {' '}
              you will find each of the
              individual solutions as a table. You can select
              here which solution to view on the map and
              download the results.
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
            <p>
              Under
              {' '}
              <b>Solutions</b>
              {' '}
              you can see each individual
              solution and it&apos;s details
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

              {!section && (
                <Sections
                  key="sections"
                  sections={SECTIONS}
                  onChangeSection={onChangeSection}
                />
              )}

              {section === 'details' && (
                <SolutionsDetails
                  key="details"
                  onChangeSection={onChangeSection}
                  onScheduleScenario={() => console.info('Schedule scenario - solutions')}
                  numberOfSchedules={2}
                />
              )}

              {section === 'gap-analysis' && (
                <SolutionsGapAnalysis
                  key="gap-analysis"
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
