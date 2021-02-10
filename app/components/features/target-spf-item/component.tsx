import React, { useRef, useState } from 'react';
import cx from 'classnames';
import Button from 'components/button';
import Slider from 'components/forms/slider';
import Label from 'components/forms/label';
import Input from 'components/forms/input';

import { TargetSPFItemProps, Type, TargetSPF } from './types';

export const TargetSPFItem: React.FC<TargetSPFItemProps> = ({
  className,
  targetSPF,
  onRemove,
  onChange,
}: TargetSPFItemProps) => {
  const [targetSPFValue, setTargetSPFValue] = useState<TargetSPF>(targetSPF);
  const sliderLabelRef = useRef(null);
  const {
    isAllTargets, type, name, surface, targetValue, spfValue, id,
  } = targetSPFValue;

  return (
    <div
      key={id}
      className={cx({
        'bg-gray-800 text-white text-xs pl-4 py-2': true,
        'border-l-4': !isAllTargets,
        'border-bioregional': type === Type.BIOREGIONAL,
        'border-species': type === Type.SPECIES,
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
            onClick={() => onRemove && onRemove(targetSPFValue)}
          >
            Remove
          </Button>
        )}
      </div>
      <div className="flex">
        <div className="relative flex-col w-full pr-4">
          <div className="absolute top-0 right-4">
            {surface}
          </div>
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
              const newValue: TargetSPF = {
                ...targetSPFValue,
                targetValue: sliderValue,
              };
              setTargetSPFValue(newValue);
              if (onChange) onChange(newValue);
            }}
          />
          <div className="flex justify-between w-full text-gray-400">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
        <div className="flex-col w-20 px-4 border-l-2">
          <span>{isAllTargets ? 'ALL SPF' : 'SPF'}</span>
          <Input
            theme="secondary"
            defaultValue={spfValue}
            onChange={({ target: { value: inputValue } }) => {
              const newValue: TargetSPF = {
                ...targetSPFValue,
                spfValue: Number(inputValue),
              };
              setTargetSPFValue(newValue);
              if (onChange) onChange(newValue);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TargetSPFItem;
