import React, { useState, useCallback } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import Button from 'components/button';

import Pill from 'layout/pill';

import Sections from 'layout/scenarios/sidebar/solutions/sections';
import SolutionsDetails from 'layout/scenarios/sidebar/solutions/details';
import SolutionsGapAnalysis from 'layout/scenarios/sidebar/solutions/gap-analysis';
import SolutionsList from 'layout/scenarios/sidebar/solutions/list';
import { ScenarioSidebarTabs } from 'layout/scenarios/sidebar/types';
import HelpBeacon from 'layout/help/beacon';

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
    <div className="w-full h-full">
      <HelpBeacon
        id="scenarios-solutions"
        title="Solutions"
        subtitle="View the results"
        content={(
          <div>
            Under
            {' '}
            <b>Details</b>
            {' '}
            you will find each of the
            individual solutions as a table. You can select
            here which solution to view on the map and
            download the results.

            <br />
            <br />
            Under
            {' '}
            <b>Gap Analysis</b>
            {' '}
            you can see
            how much your conservation network would improve
            the current conservation of your features.
            <br />
            <br />
            Under
            {' '}
            <b>Solutions</b>
            {' '}
            you can see each individual
            solution and it&apos;s details

            <br />
            <br />

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
                onChangeSection={onChangeSection}
              />
              )}

              {section === SolutionsSections.DETAILS && (
              <SolutionsDetails
                key={SolutionsSections.DETAILS}
                onChangeSection={onChangeSection}
                onScheduleScenario={() => console.info('Schedule scenario - solutions')}
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
              <div className="">
                <HelpBeacon
                  id="scenarios-rerun"
                  title="Re-Run scenario"
                  subtitle=""
                  content={(
                    <div>
                      Once you have checked your solutions,
                      you can go back to any of the previous tabs
                      and make any needed
                      adjustments.
                      Use this button to run the Scenario again applying
                      the changes you have made.
                      <br />
                      <br />
                      <i>
                        All the
                        solutions of your previous run will be replaced
                        by those of the new run.
                        If you do not want to lose your results
                        simply duplicate this scenario and make the
                        changes in the new one.
                      </i>

                    </div>
                )}
                  modifiers={['flip']}
                  tooltipPlacement="left"
                >
                  <div>
                    <Button
                      theme="spacial"
                      size="lg"
                      onClick={() => console.info('Re-Run scenario - solutions')}
                    >
                      Re-Run scenario
                    </Button>
                  </div>
                </HelpBeacon>
              </div>
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
      </HelpBeacon>
    </div>
  );
};

export default ScenariosSidebarSolutions;
