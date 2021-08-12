import React from 'react';

import cx from 'classnames';

import Label from 'components/forms/label';

import { ShowTargetSPFItemProps, Type } from './types';

export const TargetSPFItem: React.FC<ShowTargetSPFItemProps> = ({
  className,
  type,
  name,
  target,
  fpf,
  id,
}: ShowTargetSPFItemProps) => {
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
        <span className="pr-5 text-sm font-medium font-heading">{name}</span>

      </div>
      <div className="flex">
        <div className="relative flex-col w-full pr-4">
          <Label className="mb-1 uppercase">
            TARGET
          </Label>
          <p>{`${target}%`}</p>
        </div>
        <div className="flex flex-col justify-between w-24 px-4 border-l">
          <span>FPF</span>
          <p>{fpf}</p>
        </div>
      </div>
    </div>
  );
};

export default TargetSPFItem;
