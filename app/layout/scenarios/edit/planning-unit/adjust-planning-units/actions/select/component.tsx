import { useEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import ActionsSummary from 'layout/scenarios/edit/planning-unit/adjust-planning-units/actions-summary';

export const SelectPUMethod = (): JSX.Element => {
  const { query } = useRouter();
  const { sid } = query as { sid: string };

  const scenarioSlice = getScenarioEditSlice(sid);
  const dispatch = useDispatch();

  const { setClicking, setTmpPuIncludedValue, setTmpPuExcludedValue, setTmpPuAvailableValue } =
    scenarioSlice.actions;

  const { puIncludedValue, puExcludedValue, puAvailableValue } = useSelector(
    (state) => state[`/scenarios/${sid}/edit`]
  );

  useEffect(() => {
    dispatch(setClicking(true));

    return () => {
      dispatch(setClicking(false));
      dispatch(setTmpPuIncludedValue([]));
      dispatch(setTmpPuExcludedValue([]));
      dispatch(setTmpPuAvailableValue([]));
    };
  }, []);

  return (
    <>
      <span className="text-sm text-gray-400">
        Select cells on the map to include them on the analysis
      </span>
      <ActionsSummary method="select" />
    </>
  );
};

export default SelectPUMethod;
