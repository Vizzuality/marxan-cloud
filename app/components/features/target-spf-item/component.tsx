import React, { useEffect, useRef, useState } from 'react';
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
  defaultTarget = 50,
  defaultFPF = 1,
  target,
  fpf,
  id,
  onRemove,
  onChangeTarget,
  onChangeFPF,
}: TargetSPFItemProps) => {
  const [targetValue, setTargetValue] = useState((target || defaultTarget) / 100);
  const [FPFValue, setFPFValue] = useState(fpf || defaultFPF);
  const sliderLabelRef = useRef(null);

  useEffect(() => {
    if (typeof target !== 'undefined') setTargetValue(target / 100);
  }, [target]);

  useEffect(() => {
    if (typeof fpf !== 'undefined') setFPFValue(fpf);
  }, [fpf]);

  return (
    <div
      key={id}
      className={cx({
        'bg-gray-700 text-white text-xs pl-5 py-2 relative border-transparent': true,
        [className]: !!className,
      })}
    >
      <div
        className={cx({
          'absolute left-0 top-0 h-full w-1': true,
          'bg-green-300': type === Type.BIOREGIONAL,
          'bg-yellow-300': type === Type.SPECIES,
          'bg-gradient-to-b from-green-300 to-yellow-300': type === Type.BIOREGIONAL_AND_SPECIES, // temporary color
        })}
      />
      <div className="flex items-start justify-between pb-2 pr-2">
        <span className="pr-5 text-sm font-medium font-heading">{isAllTargets ? 'Set target and SPF in all features' : name}</span>
        {!isAllTargets && (
          <Button
            className="flex-shrink-0 text-xs"
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
            value={targetValue}
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
              value={FPFValue}
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
