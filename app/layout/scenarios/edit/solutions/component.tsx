import React, { useCallback, useEffect, useMemo } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { AnimatePresence, motion } from 'framer-motion';
import { ScenarioSidebarTabs, ScenarioSidebarSubTabs } from 'utils/tabs';

import { useScenario } from 'hooks/scenarios';
import { useAllSolutions, useBestSolution, useSolution } from 'hooks/solutions';

import HelpBeacon from 'layout/help/beacon';
import Pill from 'layout/pill';
import PostGapAnalysis from 'layout/scenarios/edit/solutions/gap-analysis';
import SolutionsDetails from 'layout/scenarios/edit/solutions/overview';
import ScheduleScenario from 'layout/scenarios/edit/solutions/schedule';
import Sections from 'layout/sections';

import Select from 'components/forms/select';

import { ScenariosSidebarShowSolutionsProps } from './types';

export const SECTIONS = [
  // {
  //   id: ScenarioSidebarSubTabs.SCHEDULE_SCENARIO,
  //   name: 'Schedule scenario',
  //   description: 'Comming feature...',
  //   disabled: true,
  // },
  {
    id: ScenarioSidebarSubTabs.POST_GAP_ANALYSIS,
    name: 'Target Achievement',
    description: 'View the selected solution´s performance in achieveing the feature targets.',
  },
];

export const ScenariosSidebarShowSolutions: React.FC<ScenariosSidebarShowSolutionsProps> = () => {
  const { query } = useRouter();
  const { sid } = query;

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setSelectedSolution, setSubTab } = scenarioSlice.actions;

  const { tab, subtab, selectedSolution } = useSelector((state) => state[`/scenarios/${sid}/edit`]);
  const dispatch = useDispatch();

  const { data: scenarioData } = useScenario(sid);

  const { data: allSolutionsData } = useAllSolutions(sid);

  const {
    data: selectedSolutionData,
  } = useSolution(sid, selectedSolution?.id);

  const {
    data: bestSolutionData,
  } = useBestSolution(sid, {
    enabled: scenarioData?.ranAtLeastOnce,
  });

  const SOLUTION_DATA = selectedSolutionData || bestSolutionData;
  const IS_BEST_SOLUTION = (selectedSolution
    && bestSolutionData
    && selectedSolution?.id === bestSolutionData?.id) || !selectedSolution?.id;

  const ALL_SOLUTIONS_OPTIONS = useMemo(() => {
    if (!allSolutionsData) return [];

    return allSolutionsData.map((s) => ({
      id: s.id,
      label: `Run number ${s.runId}`,
      value: s.runId,
    }));
  }, [allSolutionsData]);

  console.log(ALL_SOLUTIONS_OPTIONS);

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
              You can select which solution to view on the map and download the results.
            </p>
            <p>
              Under
              {' '}
              <b>Target Achievement</b>
              {' '}
              you can see how well the solutions meet your feature targets.
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
                <div className="flex items-baseline space-x-4">
                  <h2 className="text-lg font-medium font-heading">Solutions</h2>
                </div>
                <div>
                  <Select
                    theme="dark"
                    status="none"
                    size="s"
                    options={ALL_SOLUTIONS_OPTIONS}
                    selected={selectedSolution?.runId || SOLUTION_DATA?.runId}
                    onChange={(v) => {
                      const solution = allSolutionsData.find((s) => s.runId === v);
                      dispatch(setSelectedSolution(solution));
                    }}
                  />

                  {IS_BEST_SOLUTION && (
                    <span className="block mt-1 mr-5 text-xs text-right text-primary-500">Best solution selected</span>
                  )}
                </div>
              </header>

              <div className="relative flex flex-col flex-grow min-h-0 overflow-hidden">
                <div className="absolute top-0 left-0 z-10 w-full h-6 bg-gradient-to-b from-gray-700 via-gray-700" />
                <div className="flex flex-col flex-grow overflow-x-hidden overflow-y-auto">
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
                      scrollable={false}
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
                </div>
                <div className="absolute bottom-0 left-0 z-10 w-full h-6 bg-gradient-to-t from-gray-700 via-gray-700" />
              </div>
            </Pill>

          </AnimatePresence>
        </motion.div>
      </HelpBeacon>
    </div>
  );
};

export default ScenariosSidebarShowSolutions;
