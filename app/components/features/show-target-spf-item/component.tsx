import React from 'react';

import cx from 'classnames';
import { percentageFormatter } from 'utils/numbers';

import Label from 'components/forms/label';
import InfoButton from 'components/info-button';

import { ShowTargetSPFItemProps, Type } from './types';

export const TargetSPFItem: React.FC<ShowTargetSPFItemProps> = ({
  className,
  type,
  name,
  target,
  fpf,
  id,
  firstFeature,
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
      <div className="flex items-start justify-between pb-4 pr-2">
        <span className="pr-5 text-sm font-medium font-heading">{name}</span>

      </div>
      <div className="flex">
        <div className="relative flex-col w-full pr-4">
          <div className="flex items-baseline space-x-3">

            <Label className="mb-1 uppercase">
              TARGET
            </Label>
            {firstFeature && (
              <InfoButton>
                <div>
                  <h4 className="font-heading text-lg mb-2.5">What is a target?</h4>
                  <div className="space-y-2">
                    <p>
                      This value represents how much you want to conserve of a particular
                      feature. In an ideal conservation, land or sea use plan,
                      all your features meet their targets.
                    </p>
                    <p>
                      You can set a default
                      value for all of your features
                      or you can set individual the targets separately for each feature.
                      You can set your targets to 100% if you want the whole extent of
                      your feature to be included in the solution.
                    </p>
                  </div>
                </div>
              </InfoButton>
            )}
          </div>

          <p>{target && percentageFormatter(target)}</p>
        </div>
        <div className="flex flex-col justify-between w-24 px-4 border-l">
          <div className="flex items-baseline space-x-3">
            <span>FPF</span>
            {firstFeature && (
              <InfoButton>
                <div>
                  <h4 className="font-heading text-lg mb-2.5">What is the FPF?</h4>
                  <div className="space-y-2">
                    <p>
                      FPF stands for
                      {' '}
                      <b>Feature Penalty Factor</b>
                      .
                      A higher FPF value forces the Marxan algorithm
                      to choose the planning units where this feature
                      is present by applying a penalty if the target
                      is missed, thereby increasing
                      the cost of the solution. It comes into play when
                      some of your targets fail to be met.
                    </p>
                    <p>
                      In a typical
                      workflow you start out with all FPF values set at
                      1 and after checking the results, increase the FPF
                      values for the particular features where targets have
                      been missed.
                    </p>
                  </div>
                </div>
              </InfoButton>
            )}
          </div>
          <p>{fpf}</p>
        </div>
      </div>
    </div>
  );
};

export default TargetSPFItem;
