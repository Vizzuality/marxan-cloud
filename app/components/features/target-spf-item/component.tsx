import React, { useEffect, useRef, useState } from 'react';

import cx from 'classnames';

import Button from 'components/button';
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import Slider from 'components/forms/slider';

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
  editable,
  onRemove,
  onChangeTarget,
  onChangeFPF,
}: TargetSPFItemProps) => {
  const [targetValue, setTargetValue] = useState((target || defaultTarget) / 100);
  const [FPFValue, setFPFValue] = useState(fpf || defaultFPF);
  const [inputFPFValue, setInputFPFValue] = useState(String(FPFValue));

  const sliderLabelRef = useRef(null);

  useEffect(() => {
    if (typeof target !== 'undefined') setTargetValue(target / 100);
  }, [target]);

  useEffect(() => {
    if (typeof fpf !== 'undefined') setFPFValue(fpf);
  }, [fpf]);

  useEffect(() => {
    setInputFPFValue(String(FPFValue));
  }, [FPFValue]);

  return (
    <div
      key={id}
      className={cx({
        'text-white text-xs pl-5 py-2 mb-2 relative border-transparent': true,
        [className]: !!className,
        'bg-gray-700': !isAllTargets,
        'bg-gray-500 border rounded-lg': isAllTargets,
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
        <span className={cx({
          'pr-5 text-sm font-medium font-heading': true,
          'w-4/5': !editable,
        })}
        >
          {isAllTargets ? 'Set target and SPF in all features' : name}
        </span>
        {!isAllTargets && editable && (
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
            disabled={!editable}
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
        <div className="flex flex-col justify-between w-24 px-4 border-l border-gray-500">
          <span>{isAllTargets ? 'ALL SPF' : 'SPF'}</span>
          <div className="w-10 mb-6">
            <Input
              className="px-0 py-1 rounded"
              theme="dark"
              mode="dashed"
              type="number"
              value={inputFPFValue}
              disabled={!editable}
              onChange={({ target: { value: inputValue } }) => {
                setInputFPFValue(inputValue);
              }}
              onBlur={() => {
                // If user leaves the input empty, we'll revert to the original targetValue
                if (!inputFPFValue) {
                  setInputFPFValue(String(FPFValue));
                  return;
                }
                // Prevent changing all targets if user didn't actually change it
                // (despite clicking on the input)
                if (FPFValue === Number(inputFPFValue)) return;
                setFPFValue(Number(inputFPFValue));
                if (onChangeFPF) onChangeFPF(Number(inputFPFValue));
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TargetSPFItem;
