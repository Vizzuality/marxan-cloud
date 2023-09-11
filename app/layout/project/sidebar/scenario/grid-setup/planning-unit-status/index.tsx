import React, { useCallback, useEffect, useMemo } from 'react';

import { useRouter } from 'next/router';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { getScenarioEditSlice } from 'store/slices/scenarios/edit';
import { PUAction } from 'store/slices/scenarios/types';

import { motion } from 'framer-motion';

import { useCanEditScenario } from 'hooks/permissions';
import { useScenarioPU } from 'hooks/scenarios';

import InfoButton from 'components/info-button';
import Section from 'layout/section';

import LOCK_IN_OUT_IMG from 'images/info-buttons/img_lockin_lock_out.png';

import PlanningUnitMethods from './actions';
import Tabs from './tabs';
import type { PlanningUnitTabsProps } from './tabs';

export const GridSetupPlanningUnits = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { query } = useRouter();
  const { pid, sid } = query as { pid: string; sid: string };

  const scenarioSlice = useMemo(() => getScenarioEditSlice(sid), [sid]);
  const { setLayerSettings } = scenarioSlice.actions;

  const { setPUAction } = scenarioSlice.actions;

  const { puAction } = useAppSelector((state) => state[`/scenarios/${sid}/edit`]);

  const editable = useCanEditScenario(pid, sid);
  const { data: PUData } = useScenarioPU(sid);

  const onChangeTab = useCallback(
    (t: Parameters<PlanningUnitTabsProps['onChange']>[0]) => {
      dispatch(setPUAction(t));
    },
    [dispatch, setPUAction]
  );

  useEffect(() => {
    dispatch(
      setLayerSettings({
        id: 'lock-available',
        settings: { visibility: true },
      })
    );
    dispatch(
      setLayerSettings({
        id: 'lock-in',
        settings: { visibility: true },
      })
    );
    dispatch(
      setLayerSettings({
        id: 'lock-out',
        settings: { visibility: true },
      })
    );
    dispatch(
      setLayerSettings({
        id: 'wdpa-percentage',
        settings: { visibility: true },
      })
    );
  }, [dispatch, setLayerSettings]);

  return (
    <motion.div
      key="gap-analysis"
      className="flex min-h-0 flex-col items-start justify-start overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Section className="w-full">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-blue-500">Grid Setup</span>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-medium">Planning Unit Status</h3>
            <InfoButton theme="primary" className="bg-gray-500">
              <>
                <h4 className="mb-2.5 font-heading text-lg">
                  Locked-in and locked-out planning units
                </h4>
                <div className="space-y-2">
                  <p>
                    You can force Marxan to include or exclude some planning units from your
                    analysis.
                  </p>
                  <p>
                    Manually including or excluding individual planning units is useful when a
                    real-world issue affects where new protected areas can be designated. For
                    example, if you know that a particular planning unit contains a restricted
                    military area and cannot be designated, then you could manually exclude that
                    planning unit from the project.
                  </p>
                  <p>
                    You can see the example below where a city is marked as locked-out and a
                    protected area is marked as locked-in:
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
        </div>

        <div className="mt-2.5 flex w-full items-center justify-between border-b border-gray-700">
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
      </Section>
    </motion.div>
  );
};

export default GridSetupPlanningUnits;
