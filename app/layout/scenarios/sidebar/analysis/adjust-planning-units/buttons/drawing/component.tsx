import React, { useEffect } from 'react';

import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { getScenarioSlice } from 'store/slices/scenarios/edit';

export interface AnalysisAdjustDrawingProps {

}

export const AnalysisAdjustDrawing: React.FC<AnalysisAdjustDrawingProps> = () => {
  const { query } = useRouter();
  const { sid } = query;

  const scenarioSlice = getScenarioSlice(sid);
  const { setDrawing, setDrawingGeo } = scenarioSlice.actions;

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setDrawing('polygon'));

    return () => {
      dispatch(setDrawing(null));
      dispatch(setDrawingGeo(null));
    };
  }, []); // eslint-disable-line

  return (
    <div className="flex w-full">
      <p className="text-sm text-gray-300">Click over the map, and select planning units.</p>
    </div>
  );
};

export default AnalysisAdjustDrawing;
