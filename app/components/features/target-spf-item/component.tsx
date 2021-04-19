import React, { useRef, useState } from 'react';
import cx from 'classnames';
import Button from 'components/button';
import Slider from 'components/forms/slider';
import Label from 'components/forms/label';
import Input from 'components/forms/input';

import { TargetSPFItemProps, Type } from './types';

export const TargetSPFItem: React.FC<TargetSPFItemProps> = ({
  className,
  isAllTargets,
  type,
  name,
  target = 50,
  fpf = 1,
  id,
  onRemove,
  onChangeTarget,
  onChangeFPF,
}: TargetSPFItemProps) => {
  const [targetValue, setTargetValue] = useState(target / 100);
  const [FPFValue, setFPFValue] = useState(fpf);
  const sliderLabelRef = useRef(null);

  return (
    <div
      key={id}
      className={cx({
        'bg-gray-700 text-white text-xs pl-4 py-2': true,
        'border-l-4': !isAllTargets,
        'border-green-300': type === Type.BIOREGIONAL,
        'border-yellow-300': type === Type.SPECIES,
        'border-indigo': type === Type.BIOREGIONAL_AND_SPECIES, // temporary color
        [className]: !!className,
      })}
    >
      <div className="flex justify-between pb-4 pr-2">
        <span className="text-sm">{isAllTargets ? 'Set target and SPF in all features' : name}</span>
        {!isAllTargets && (
          <Button
            className="text-xs"
            theme="secondary"
            size="xs"
            onClick={() => onRemove && onRemove(id)}
          >
            Remove
          </Button>
        )}
      </div>
      <div className="flex">
        <div className="relative flex-col w-full pr-4">
          <Label ref={sliderLabelRef} className="mb-1 uppercase">
            <span>{isAllTargets ? 'ALL TARGETS' : 'TARGET'}</span>
          </Label>
          <Slider
            labelRef={sliderLabelRef}
            minValue={0}
            maxValue={1}
            defaultValue={targetValue}
            step={0.01}
            onChange={(sliderValue) => {
              setTargetValue(sliderValue);
              if (onChangeTarget) onChangeTarget(+(sliderValue * 100).toFixed(0));
            }}
          />
          <div className="flex justify-between w-full text-gray-400">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
        <div className="flex flex-col justify-between w-24 px-4 border-l">
          <span>{isAllTargets ? 'ALL SPF' : 'SPF'}</span>
          <div className="w-10 mb-6">
            <Input
              className="px-0 py-1"
              theme="dark"
              mode="dashed"
              type="number"
              defaultValue={FPFValue}
              onChange={({ target: { value: inputValue } }) => {
                setFPFValue(Number(inputValue));
                if (onChangeFPF) onChangeFPF(Number(inputValue));
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TargetSPFItem;
