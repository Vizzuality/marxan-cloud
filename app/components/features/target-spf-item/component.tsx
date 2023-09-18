import React, { useEffect, useRef, useState } from 'react';

import Input from 'components/forms/input';
import Label from 'components/forms/label';
import Slider from 'components/forms/slider';
import Icon from 'components/icon';
import Tooltip from 'components/tooltip';
import { cn } from 'utils/cn';

import HIDE_SVG from 'svgs/ui/hide.svg?sprite';
import REMOVE_SVG from 'svgs/ui/remove.svg?sprite';
import SHOW_SVG from 'svgs/ui/show.svg?sprite';

import { TargetSPFItemProps } from './types';

export const TargetSPFItem: React.FC<TargetSPFItemProps> = ({
  className,
  isAllTargets,
  name,
  defaultTarget = 50,
  defaultFPF = 1,
  target,
  fpf,
  id,
  editable,
  isShown,
  onRemove,
  onChangeTarget,
  onChangeFPF,
  onSeeOnMap,
}: TargetSPFItemProps) => {
  const inputRef = useRef<HTMLInputElement>();
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
      className={cn({
        'relative mb-2 border-transparent py-2 pl-5 text-xs text-white': true,
        [className]: !!className,
        'bg-gray-800': !isAllTargets,
        'rounded-lg border bg-gray-700': isAllTargets,
      })}
    >
      <div
        className={cn({
          'absolute left-0 top-0 h-full w-1 ': true,
          'bg-yellow-500': !isAllTargets,
        })}
      />
      <div className="flex items-start justify-between pb-2 pr-2">
        <span
          className={cn({
            'pr-10 font-heading text-sm font-medium': true,
            'w-4/5': !editable,
          })}
        >
          {isAllTargets ? 'Set target and SPF in all features' : name}
        </span>
        <div className="mr-3 flex space-x-2">
          {!isAllTargets && (
            <Tooltip
              arrow
              placement="top"
              content={<div className="rounded bg-white p-2 text-gray-600">See on map</div>}
            >
              <button
                aria-label="manage-see-on-map"
                type="button"
                onClick={onSeeOnMap}
                className={cn({
                  'flex h-5 w-5 items-center justify-center text-white': true,
                  'text-gray-400': !isShown,
                })}
              >
                <Icon className="h-4 w-4" icon={isShown ? SHOW_SVG : HIDE_SVG} />
              </button>
            </Tooltip>
          )}
          {!isAllTargets && editable && (
            <Tooltip
              arrow
              placement="top"
              content={<div className="rounded bg-white p-2 text-gray-600">Remove</div>}
            >
              <button
                aria-label="manage-see-on-map"
                type="button"
                onClick={() => onRemove && onRemove(id)}
                className="flex h-5 w-5 items-center justify-center text-white"
              >
                <Icon className="h-4 w-4" icon={REMOVE_SVG} />
              </button>
            </Tooltip>
          )}
        </div>
      </div>
      <div className="flex">
        <div className="relative w-full flex-col pr-4">
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
          <div className="flex w-full justify-between text-gray-100">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
        <div className="flex w-24 flex-col justify-between border-l border-gray-600 px-4">
          <span className="whitespace-nowrap">{isAllTargets ? 'ALL SPF' : 'SPF'}</span>
          <div className="mb-6 w-10">
            <Input
              className="rounded px-0 py-1"
              theme="dark"
              mode="dashed"
              type="number"
              value={inputFPFValue}
              disabled={!editable}
              onReady={(input) => {
                inputRef.current = input;
              }}
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
                // if (FPFValue === Number(inputFPFValue)) return;
                setFPFValue(Number(inputFPFValue));
                if (onChangeFPF) onChangeFPF(Number(inputFPFValue));
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  event.stopPropagation();
                  event.nativeEvent.stopImmediatePropagation();
                  event.nativeEvent.stopPropagation();
                  event.nativeEvent.preventDefault();

                  if (inputRef.current) {
                    inputRef?.current?.blur();
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TargetSPFItem;
