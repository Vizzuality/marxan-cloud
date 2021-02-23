import React, { useState } from 'react';

import Icon from 'components/icon';
import Input from 'components/forms/input';

import INFO_SVG from 'svgs/project/info.svg?sprite';

import { PlanningUnitAreaSizeProps } from './types';

export const PlanningUnitAreaSize: React.FC<PlanningUnitAreaSizeProps> = ({
  size,
}: PlanningUnitAreaSizeProps) => {
  const [selectedSize, setSelectedSize] = useState(size);
  return (
    <div className="mt-6">
      <div className="flex items-center">
        <h5 className="text-white uppercase text-xxs">Planning unit area size</h5>
        <button
          className="w-5 h-5 ml-2"
          type="button"
          onClick={() => console.info('Planning Unit Area size info button click')}
        >
          <Icon icon={INFO_SVG} />
        </button>
      </div>
      <div>
        <Input
          defaultValue={selectedSize}
          onChange={(value) => setSelectedSize(value)}
        />
      </div>
    </div>
  );
};

export default PlanningUnitAreaSize;
