import React, { useCallback, useEffect, useMemo } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { AnimatePresence, motion } from 'framer-motion';

import { useScenario } from 'hooks/scenarios';
import { useAllSolutions, useBestSolution, useSolution } from 'hooks/solutions';

import Select from 'components/forms/select';
import Icon from 'components/icon';
import HelpBeacon from 'layout/help/beacon';
import Pill from 'layout/pill';
import PostGapAnalysis from 'layout/scenarios/edit/solutions/gap-analysis';
import SolutionsDetails from 'layout/scenarios/edit/solutions/overview';
import ScheduleScenario from 'layout/scenarios/edit/solutions/schedule';
import Sections from 'layout/sections';
import { ScenarioSidebarTabs, ScenarioSidebarSubTabs } from 'utils/tabs';

import STAR_SVG from 'svgs/ui/star.svg?sprite';

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
    description: 'View the selected solution´s performance in achieving the feature targets.',
  },
];

export const ScenariosSidebarShowSolutions: React.FC<ScenariosSidebarShowSolutionsProps> = () => {
  const { query } = useRouter();
  const { sid } = query as { sid: string };

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setSelectedSolution, setSubTab } = scenarioSlice.actions;

  const { tab, subtab, selectedSolution } = useSelector((state) => state[`/scenarios/${sid}/edit`]);
  const dispatch = useDispatch();

  const { data: scenarioData } = useScenario(sid);

  const { data: allSolutionsData } = useAllSolutions(sid);

  const { data: selectedSolutionData } = useSolution(sid, selectedSolution?.id);

  const { data: bestSolutionData } = useBestSolution(sid, {
    enabled: scenarioData?.ranAtLeastOnce,
  });

  const SOLUTION_DATA = selectedSolutionData || bestSolutionData;
  const IS_BEST_SOLUTION =
    (selectedSolution && bestSolutionData && selectedSolution?.id === bestSolutionData?.id) ||
    !selectedSolution?.id;

  const ALL_SOLUTIONS_OPTIONS = useMemo(() => {
    if (!allSolutionsData) return [];

    return allSolutionsData.map((s) => ({
      id: s.id,
      label: (
        <div className="flex items-center space-x-2">
          <span>Run number {s.runId}</span>

          {s.id === bestSolutionData?.id && (
            <Icon icon={STAR_SVG} className="ml-3 h-2.5 w-2.5 text-blue-400" />
          )}
        </div>
      ),
      value: s.runId,
    }));
  }, [allSolutionsData, bestSolutionData]);

  // CALLBACKS
  const onChangeSection = useCallback(
    (s) => {
      const sub = s || null;
      dispatch(setSubTab(sub));
    },
    [dispatch, setSubTab]
  );

  // EFFECTS
  useEffect(() => {
    if (!SECTIONS.find((s) => s.id === subtab)) {
      dispatch(setSubTab(null));
    }
  }, []); // eslint-disable-line

  if (!scenarioData || tab !== ScenarioSidebarTabs.SOLUTIONS) return null;

  return (
    <div className="flex h-full w-full flex-grow flex-col overflow-hidden">
      <HelpBeacon
        id="scenarios-solutions"
        title="Solutions"
        subtitle="View the results"
        content={
          <div className="space-y-2">
            <p>
              Under <b>Solution Overview</b> you will find the information for each of the
              individual solutions as a table. You can see all solutions or you can filter to see
              only the 5 most different ones. You can select which solution to view on the map and
              download the results.
            </p>
            <p>
              Under <b>Target Achievement</b> you can see how well the solutions meet your feature
              targets.
            </p>
          </div>
        }
        modifiers={['flip']}
        tooltipPlacement="left"
      >
        <motion.div
          key={ScenarioSidebarTabs.SOLUTIONS}
          className="flex min-h-0 flex-col overflow-hidden"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AnimatePresence>
            <Pill selected>
              <header className="flex flex-shrink-0 justify-between">
                <div className="flex items-baseline space-x-4">
                  <h2 className="font-heading text-lg font-medium">Solutions</h2>
                </div>
                <div className="mt-0.5">
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
                    <span className="mr-5 mt-1 block text-right text-xs text-primary-500">
                      Best solution selected
                    </span>
                  )}
                </div>
              </header>

              <div className="relative flex min-h-0 flex-grow flex-col overflow-hidden">
                <div className="absolute left-0 top-0 z-10 h-6 w-full bg-gradient-to-b from-gray-700 via-gray-700" />
                <div className="flex flex-grow flex-col overflow-y-auto overflow-x-hidden">
                  {!subtab && <SolutionsDetails key="solutions-overview" />}

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
                    <PostGapAnalysis key="post-gap-analysis" onChangeSection={onChangeSection} />
                  )}
                </div>
                <div className="absolute bottom-0 left-0 z-10 h-6 w-full bg-gradient-to-t from-gray-700 via-gray-700" />
              </div>
            </Pill>
          </AnimatePresence>
        </motion.div>
      </HelpBeacon>
    </div>
  );
};

export default ScenariosSidebarShowSolutions;
