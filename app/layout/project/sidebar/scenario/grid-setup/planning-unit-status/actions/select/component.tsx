import { useEffect } from 'react';

import { useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

export const SelectPUMethod = (): JSX.Element => {
  const { query } = useRouter();
  const { sid } = query as { sid: string };

  const scenarioSlice = getScenarioEditSlice(sid);
  const dispatch = useDispatch();

  const { setClicking, setTmpPuIncludedValue, setTmpPuExcludedValue, setTmpPuAvailableValue } =
    scenarioSlice.actions;

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
    <span className="text-sm text-gray-400">
      Select cells on the map to include them on the analysis
    </span>
  );
};

export default SelectPUMethod;
