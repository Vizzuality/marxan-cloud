import React from 'react';

import BLMChart from 'components/scenarios/blm-chart';

import { DATA } from './constants';

export interface ScenariosRunChartProps {
}

export const ScenariosRunChart: React.FC<ScenariosRunChartProps> = () => {
  return (
    <div className="relative h-full p-5">
      <div className="absolute top-0 left-0 z-0 w-full h-full opacity-50 bg-gradient-to-b from-white to-blue-50 rounded-3xl" />
      <div
        className="relative z-10 h-full"
      >
        <BLMChart data={DATA} />
      </div>
    </div>
  );
};

export default ScenariosRunChart;
