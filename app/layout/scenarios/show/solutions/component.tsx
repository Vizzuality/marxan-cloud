import React, { useState, useCallback } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { AnimatePresence, motion } from 'framer-motion';
import { mergeScenarioStatusMetaData } from 'utils/utils-scenarios';

import { useScenario, useSaveScenario } from 'hooks/scenarios';

import HelpBeacon from 'layout/help/beacon';
import Pill from 'layout/pill';
import { ScenarioSidebarTabs } from 'layout/scenarios/show/sidebar/types';
import SolutionsDetails from 'layout/scenarios/show/solutions/details';
import SolutionsGapAnalysis from 'layout/scenarios/show/solutions/gap-analysis';
import SolutionsList from 'layout/scenarios/show/solutions/list';
import Sections from 'layout/scenarios/show/solutions/sections';

import Button from 'components/button';

import { SolutionsSections } from './sections/types';
import { ScenariosSidebarShowSolutionsProps } from './types';

export const ScenariosSidebarShowSolutions: React.FC<ScenariosSidebarShowSolutionsProps> = ({
  readOnly,
}: ScenariosSidebarShowSolutionsProps) => {
  const [section, setSection] = useState(null);
  const { query } = useRouter();
  const { sid } = query;

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setSubTab } = scenarioSlice.actions;

  const { tab } = useSelector((state) => state[`/scenarios/${sid}/edit`]);
  const dispatch = useDispatch();

  const { data: scenarioData } = useScenario(sid);
  const { metadata } = scenarioData || {};

  const saveScenarioMutation = useSaveScenario({
    requestConfig: {
      method: 'PATCH',
    },
  });

  const saveTabsStatus = useCallback(async (subtab) => {
    saveScenarioMutation.mutate({
      id: `${sid}`,
      data: {
        metadata: mergeScenarioStatusMetaData(metadata, { tab: 'solutions', subtab: `${subtab}` }),
      },
    });
  }, [saveScenarioMutation, sid, metadata]);

  // CALLBACKS
  const onChangeSection = useCallback((s) => {
    setSection(s);
    const subtab = s ? `solutions-${s}` : 'solutions-preview';
    dispatch(setSubTab(subtab));
    saveTabsStatus(subtab);
  }, [dispatch, setSubTab, saveTabsStatus]);

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
                  onChangeSection={onChangeSection}
                />
              )}

              {section === SolutionsSections.DETAILS && (
                <SolutionsDetails
                  key={SolutionsSections.DETAILS}
                  onChangeSection={onChangeSection}
                  onScheduleScenario={() => console.info('Schedule scenario - solutions')}
                  numberOfSchedules={2}
                  readOnly={readOnly}
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
                      <div className="space-y-2">
                        <p>
                          Once you have checked your solutions,
                          you can go back to any of the previous tabs
                          and make any needed
                          adjustments.
                          Use this button to run the Scenario again applying
                          the changes you have made.
                        </p>

                        <p>
                          <i>
                            All the
                            solutions of your previous run will be replaced
                            by those of the new run.
                            If you do not want to lose your results
                            simply duplicate this scenario and make the
                            changes in the new one.
                          </i>
                        </p>
                      </div>
                  )}
                    modifiers={['flip']}
                    tooltipPlacement="top"
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

                {/* <Button
                  className="ml-4"
                  theme="primary"
                  size="lg"
                  onClick={() => console.info('Save scenario - solutions')}
                >
                  Save Scenario
                </Button> */}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </HelpBeacon>
    </div>
  );
};

export default ScenariosSidebarShowSolutions;
