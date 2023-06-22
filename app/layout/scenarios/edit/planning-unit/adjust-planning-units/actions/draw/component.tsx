import { useEffect } from 'react';

import { useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import ActionsSummary from 'layout/scenarios/edit/planning-unit/adjust-planning-units/actions-summary';

export const DrawPUMethod = (): JSX.Element => {
  const { query } = useRouter();
  const { sid } = query as { sid: string };
  const dispatch = useDispatch();

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setDrawing, setDrawingValue } = scenarioSlice.actions;

  useEffect(() => {
    dispatch(setDrawing('polygon'));

    return () => {
      dispatch(setDrawing(null));
      dispatch(setDrawingValue(null));
    };
  }, []);

  return (
    <>
      <span className="text-sm text-gray-400">
        Click over the map and draw a shape to include them it the analysis
      </span>
      <ActionsSummary method="draw" />
    </>
  );
};

export default DrawPUMethod;
