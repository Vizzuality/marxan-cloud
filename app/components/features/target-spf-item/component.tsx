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
  onRemove,
  onChangeTarget,
  onChangeFPF,
}: TargetSPFItemProps) => {
  const [targetValue, setTargetValue] = useState((target || defaultTarget) / 100);
  const [inputTargetValue, setInputTargetValue] = useState(targetValue);
  const [targetInputFocused, setTargetInputFocused] = useState(false);
  const [FPFValue, setFPFValue] = useState(fpf || defaultFPF);
  const sliderLabelRef = useRef(null);

  useEffect(() => {
    if (typeof target !== 'undefined') setTargetValue(target / 100);
  }, [target]);

  useEffect(() => {
    if (typeof fpf !== 'undefined') setFPFValue(fpf);
  }, [fpf]);

  useEffect(() => {
    const percentValue = Math.round(targetValue * 100);
    setInputTargetValue(percentValue);
  }, [targetValue]);

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
        <div className="flex flex-col flex-grow">
          <div className="w-full pr-5 text-sm font-medium font-heading">
            {isAllTargets ? 'Set target and SPF in all features' : name}
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center">
              <Label ref={sliderLabelRef} className="uppercase w-16">
                {isAllTargets ? 'ALL TARGETS' : 'TARGET'}
              </Label>
              <Input
                className="w-16 text-center text-sm"
                theme="dark"
                type={targetInputFocused ? 'number' : 'text'}
                min={0}
                max={100}
                step={1}
                value={targetInputFocused ? inputTargetValue : `${inputTargetValue}%`}
                onFocusChange={setTargetInputFocused}
                onChange={((event) => {
                  const percentValue = parseInt(event.target.value, 10);
                  if (percentValue < 0 || percentValue > 100) return;
                  setInputTargetValue(percentValue);
                })}
                onBlur={() => {
                  // Prevent changing all targets if user didn't actually change it
                  // (despite clicking on the input)
                  if (Math.round(targetValue * 100) === inputTargetValue) return;
                  setTargetValue(inputTargetValue / 100);
                  if (onChangeTarget) onChangeTarget(inputTargetValue);
                }}
              />
            </div>
            <div className="flex items-center">
              <span>{isAllTargets ? 'ALL SPF' : 'SPF'}</span>
              <Input
                className="w-16 ml-3 text-center text-sm"
                theme="dark"
                type="number"
                value={FPFValue}
                onChange={({ target: { value: inputValue } }) => {
                  setFPFValue(Number(inputValue));
                  if (onChangeFPF) onChangeFPF(Number(inputValue));
                }}
              />
            </div>
          </div>
          <div className="relative flex flex-col">
            <Slider
              labelRef={sliderLabelRef}
              minValue={0}
              maxValue={1}
              value={targetValue}
              step={0.01}
              showValue={false}
              onChange={(sliderValue) => {
                const percentValue = +(sliderValue * 100).toFixed(0);
                setTargetValue(sliderValue);
                setInputTargetValue(percentValue);
                if (onChangeTarget) onChangeTarget(percentValue);
              }}
            />
            <div className="flex justify-between -mt-3 text-gray-400">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
        <div className="flex justify-end w-28">
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
      </div>
    </div>
  );
};

export default TargetSPFItem;
