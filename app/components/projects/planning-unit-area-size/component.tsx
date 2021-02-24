import React, { useState } from 'react';

import Icon from 'components/icon';
import Input from 'components/forms/input';
import Select from 'components/dropdowns';

import INFO_SVG from 'svgs/project/info.svg?sprite';

import { PlanningUnitAreaSizeUnit, PlanningAreaSize } from 'types/project-model';

import { PlanningUnitAreaSizeProps } from './types';

export const PlanningUnitAreaSize: React.FC<PlanningUnitAreaSizeProps> = ({
  data,
  onChange,
}: PlanningUnitAreaSizeProps) => {
  const [selectedData, setSelectedData] = useState<PlanningAreaSize>(data);

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
      <div className="flex mt-4">
        <div className="w-16 mr-1">
          <Input
            defaultValue={selectedData.value}
            onChange={(event) => {
              const newData = {
                ...selectedData,
                value: Number(event.target.value),
              };
              setSelectedData(newData);
              if (onChange) {
                onChange(newData);
              }
            }}
            mode="dashed"
          />
        </div>
        <Select
          theme="dark"
          size="base"
          status="none"
          multiple={false}
          initialSelected={selectedData.unit}
          options={Object.values(PlanningUnitAreaSizeUnit)
            .map((e) => ({ label: e, value: e }))}
          onChange={(value: string) => {
            const newData = {
              ...selectedData,
              unit: PlanningUnitAreaSizeUnit[value],
            };
            setSelectedData(newData);
            if (onChange) {
              onChange(newData);
            }
          }}
        />
      </div>
    </div>
  );
};

export default PlanningUnitAreaSize;
