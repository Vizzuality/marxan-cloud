import React, { useCallback, useState } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { motion } from 'framer-motion';

import { LEGEND_LAYERS } from 'hooks/map/constants';
import { useScenario } from 'hooks/scenarios';
import { useSolution, useBestSolution } from 'hooks/solutions';

import ComingSoon from 'layout/help/coming-soon';
import SolutionFrequency from 'layout/solutions/frequency';
import SolutionSelected from 'layout/solutions/selected';

import Button from 'components/button';
import Icon from 'components/icon';
import Loading from 'components/loading';
import Modal from 'components/modal';

import ARROW_LEFT_SVG from 'svgs/ui/arrow-right-2.svg?sprite';
import CLOCK_SVG from 'svgs/ui/clock.svg?sprite';
import TABLE_SVG from 'svgs/ui/table.svg?sprite';

import SolutionsTableForm from './table/table-form/component';
import { ScenariosSolutionsOverviewProps } from './types';

export const ScenariosSolutionsOverview: React.FC<ScenariosSolutionsOverviewProps> = ({
  onChangeSection,
  onScheduleScenario,
  numberOfSchedules,
}: ScenariosSolutionsOverviewProps) => {
  const { query } = useRouter();
  const { sid } = query;
  const [showTable, setShowTable] = useState<boolean>(false);

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setLayerSettings } = scenarioSlice.actions;

  const { selectedSolution, layerSettings } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const dispatch = useDispatch();

  const {
    data: scenarioData,
  } = useScenario(sid);

  const {
    data: selectedSolutionData,
    isFetching: selectedSolutionisFetching,
    isFetched: selectedSolutionisFetched,
  } = useSolution(sid, selectedSolution?.id);

  const {
    data: bestSolutionData,
    isFetching: bestSolutionisFetching,
    isFetched: bestSolutionisFetched,
  } = useBestSolution(sid, {
    enabled: scenarioData?.ranAtLeastOnce,
  });

  const isBestSolution = (selectedSolution
    && bestSolutionData
    && selectedSolution?.id === bestSolutionData?.id) || !selectedSolution?.id;

  const solutionIsLoading = (
    bestSolutionisFetching && !bestSolutionisFetched)
    || (selectedSolutionisFetching && !selectedSolutionisFetched
    );

  const frequencyLegendValues = LEGEND_LAYERS.frequency().items;

  const onChangeVisibility = useCallback((lid) => {
    const { visibility = true } = layerSettings[lid] || {};
    dispatch(setLayerSettings({
      id: lid,
      settings: { visibility: !visibility },
    }));
  }, [dispatch, setLayerSettings, layerSettings]);

  return (
    <motion.div
      key="solutions-overview"
      className="flex flex-col items-start justify-start flex-grow min-h-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header>
        <button
          aria-label="return"
          type="button"
          className="flex items-center w-full pt-5 pb-1 space-x-2 text-left focus:outline-none"
          onClick={() => {
            onChangeSection(null);
          }}
        >
          <Icon icon={ARROW_LEFT_SVG} className="w-3 h-3 transform rotate-180 text-primary-500" />
          <h4 className="text-xs uppercase font-heading text-primary-500">Soluctions Overview</h4>
        </button>
      </header>

      <div className="flex flex-col flex-grow w-full min-h-0 overflow-hidden">
        <div className="px-0.5 overflow-x-visible overflow-y-auto">
          <div className="relative flex flex-col w-full mt-1 text-sm">
            <p className="py-4 opacity-50">
              Each solution gives you an alternative answer to your planning
              problem showing which planning units have been selected in the
              proposed conservation network, the overall cost,
              and whether targets have been met.
            </p>
            <Button
              theme="primary"
              size="base"
              className="flex h-12 mb-4"
              onClick={() => setShowTable(true)}
            >
              View solutions table
              <Icon icon={TABLE_SVG} className="absolute w-4 h-4 right-8" />
            </Button>

            <ComingSoon>
              <Button
                theme="secondary"
                size="base"
                className="w-full h-12"
                onClick={() => onScheduleScenario()}
              >
                <div className="flex flex-col justify-center">
                  Schedule scenario
                  {numberOfSchedules > 0 && (
                    <span className="text-blue-400 text-xxs">
                      {`${numberOfSchedules} schedule${numberOfSchedules > 1 ? 's' : ''}`}
                    </span>
                  )}
                </div>
                <Icon icon={CLOCK_SVG} className="absolute w-4 h-4 right-8" />
              </Button>

            </ComingSoon>

            <Modal
              open={showTable}
              title="Solutions table"
              size="wide"
              dismissable
              onDismiss={() => setShowTable(false)}
            >
              <SolutionsTableForm
                onCancel={() => setShowTable(false)}
                setShowTable={setShowTable}
              />
            </Modal>
          </div>

          <div className="w-full p-6 mt-12 border-t border-gray-600">
            <SolutionFrequency
              values={frequencyLegendValues}
              onChangeVisibility={() => onChangeVisibility('frequency')}
              settings={layerSettings.frequency}
            />
          </div>

          <div className="w-full p-6 border-t border-gray-600">
            <Loading
              visible={solutionIsLoading}
              className="absolute top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center w-full h-full bg-black bg-opacity-90"
              iconClassName="w-10 h-10 text-primary-500"
            />
            {(selectedSolutionData || bestSolutionData) && (
              <SolutionSelected
                best={isBestSolution}
                values={selectedSolutionData || bestSolutionData}
                onChangeVisibility={() => onChangeVisibility('solution')}
                settings={layerSettings.solution}
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ScenariosSolutionsOverview;
