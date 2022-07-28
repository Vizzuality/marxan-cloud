import React, { useEffect, useRef, useState } from 'react';

import cx from 'classnames';

import Input from 'components/forms/input';
import Label from 'components/forms/label';
import Slider from 'components/forms/slider';
import Icon from 'components/icon';
import Tooltip from 'components/tooltip';

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
      className={cx({
        'text-white text-xs pl-5 py-2 mb-2 relative border-transparent': true,
        [className]: !!className,
        'bg-gray-700': !isAllTargets,
        'bg-gray-500 border rounded-lg': isAllTargets,
      })}
    >
      <div
        className={cx({
          'absolute left-0 top-0 h-full w-1 ': true,
          'bg-yellow-400': !isAllTargets,
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
        <div className="flex mr-3 space-x-2">
          {!isAllTargets && (
            <Tooltip
              arrow
              placement="top"
              content={(
                <div
                  className="p-2 text-gray-500 bg-white rounded"
                >
                  See on map
                </div>
              )}
            >
              <button
                aria-label="manage-see-on-map"
                type="button"
                onClick={onSeeOnMap}
                className={cx({
                  'text-white w-5 h-5 flex justify-center items-center': true,
                  'text-gray-300': !isShown,
                })}
              >
                <Icon className="w-4 h-4" icon={isShown ? SHOW_SVG : HIDE_SVG} />
              </button>
            </Tooltip>
          )}
          {!isAllTargets && editable && (
            <Tooltip
              arrow
              placement="top"
              content={(
                <div
                  className="p-2 text-gray-500 bg-white rounded"
                >
                  Remove
                </div>
              )}
            >
              <button
                aria-label="manage-see-on-map"
                type="button"
                onClick={() => onRemove && onRemove(id)}
                className="flex items-center justify-center w-5 h-5 text-white"
              >
                <Icon className="w-4 h-4" icon={REMOVE_SVG} />
              </button>
            </Tooltip>
          )}
        </div>
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
          <span className="whitespace-nowrap">{isAllTargets ? 'ALL SPF' : 'SPF'}</span>
          <div className="w-10 mb-6">
            <Input
              className="px-0 py-1 rounded"
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
