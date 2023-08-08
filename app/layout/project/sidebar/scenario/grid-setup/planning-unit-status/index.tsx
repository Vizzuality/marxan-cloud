import React, { useCallback } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';
import { PUAction } from 'store/slices/scenarios/types';

import { motion } from 'framer-motion';

import { useCanEditScenario } from 'hooks/permissions';
import { useScenarioPU } from 'hooks/scenarios';

import InfoButton from 'components/info-button';

import LOCK_IN_OUT_IMG from 'images/info-buttons/img_lockin_lock_out.png';

import PlanningUnitMethods from './actions';
import Tabs from './tabs';
import type { PlanningUnitTabsProps } from './tabs';

export interface ScenariosSidebarAnalysisSectionsProps {
  onChangeSection: (s: string) => void;
}

export const ScenariosSidebarAnalysisSections = (): JSX.Element => {
  const dispatch = useDispatch();
  const { query } = useRouter();
  const { pid, sid } = query as { pid: string; sid: string };

  const scenarioSlice = getScenarioEditSlice(sid);

  const { setPUAction, setPuIncludedValue, setPuExcludedValue, setPuAvailableValue } =
    scenarioSlice.actions;

  const { puAction } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const editable = useCanEditScenario(pid, sid);
  const { data: PUData } = useScenarioPU(sid, {
    onSuccess: ({ included, excluded, available }) => {
      dispatch(setPuIncludedValue(included));
      dispatch(setPuExcludedValue(excluded));
      dispatch(setPuAvailableValue(available));
    },
  });

  const onChangeTab = useCallback(
    (t: Parameters<PlanningUnitTabsProps['onChange']>[0]) => {
      dispatch(setPUAction(t));
    },
    [dispatch, setPUAction]
  );

  return (
    <motion.div
      key="gap-analysis"
      className="flex min-h-0 flex-col items-start justify-start overflow-hidden rounded-[20px] bg-gray-700 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="space-y-5">
        <div className="flex items-center space-x-2">
          <h4 className="font-heading text-lg">Planning Unit</h4>

          <InfoButton theme="primary" className="bg-gray-300">
            <>
              <h4 className="mb-2.5 font-heading text-lg">
                Locked-in and locked-out planning units
              </h4>
              <div className="space-y-2">
                <p>
                  You can force Marxan to include or exclude some planning units from your analysis.
                </p>
                <p>
                  Manually including or excluding individual planning units is useful when a
                  real-world issue affects where new protected areas can be designated. For example,
                  if you know that a particular planning unit contains a restricted military area
                  and cannot be designated, then you could manually exclude that planning unit from
                  the project.
                </p>
                <p>
                  You can see the example below where a city is marked as locked-out and a protected
                  area is marked as locked-in:
                </p>
                <img src={LOCK_IN_OUT_IMG} alt="Feature-Range" />
                <p>
                  The areas selected to be included will be <b>locked in </b>
                  to your conservation plan and will appear in all of the solutions.
                </p>
                <p>
                  The areas selected to be excluded will be <b>locked out </b>
                  of your conservation plan and will never appear in the solutions
                </p>
              </div>
            </>
          </InfoButton>
        </div>
        <h5 className="font-heading uppercase">Adjust planning units</h5>
      </header>

      <div className="mt-2.5 flex w-full items-center justify-between border-b border-gray-500">
        <Tabs type={puAction as PUAction} onChange={onChangeTab} />
      </div>

      <div className="relative flex min-h-0 w-full flex-grow flex-col overflow-hidden">
        <div className="relative overflow-y-auto overflow-x-visible px-0.5 pt-3">
          {editable && <PlanningUnitMethods />}
          {/* // todo: I think this part should be updated in terms of UI */}
          {!editable && (
            <div className="mt-4 space-y-3 text-xs">
              {(puAction as PUAction) === 'include' && <p>{PUData.included.length} PU</p>}
              {(puAction as PUAction) === 'exclude' && <p>{PUData.excluded.length} PU</p>}
              {(puAction as PUAction) === 'available' && <p>{PUData.available.length} PU</p>}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ScenariosSidebarAnalysisSections;
