import React from 'react';

import cx from 'classnames';
import { blmFormat } from 'utils/units';

import Loading from 'components/loading';

export interface ScenariosBlmResultsCardProps {
  id: string;
  blmValue: number;
  cost: number;
  selected: boolean;
  pngData?: string;
  onClick: (id: number) => void;
}

export const ScenariosBlmResultsCard: React.FC<ScenariosBlmResultsCardProps> = ({
  id,
  blmValue,
  cost,
  selected,
  pngData,
  onClick,
}: ScenariosBlmResultsCardProps) => {
  return (
    <div
      role="presentation"
      key={id}
      className={cx({
        'relative overflow-hidden rounded-md cursor-pointer': true,

      })}
      onClick={() => {
        if (onClick) {
          onClick(blmValue);
        }
      }}
    >
      <div
        className={cx({
          'absolute w-full h-full top-0 left-0 z-10 ring-2 ring-offset-primary-500 ring-inset rounded-md': selected,
        })}
      />
      <dl
        className={cx({
          'p-2 space-y-0.5': true,
          'bg-gray-500': !selected,
          'bg-primary-500': selected,
        })}
      >
        <div className="flex justify-between">
          <dt
            className={cx({
              'text-xs uppercase': true,
              'text-gray-700': selected,
            })}
          >
            BLM
          </dt>
          <dd
            className={cx({
              'text-xs': true,
              'text-primary-500': !selected,
              'text-gray-700': selected,
            })}
          >
            {blmFormat(blmValue)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt
            className={cx({
              'text-xs uppercase': true,
              'text-gray-700': selected,
            })}
          >
            Cost
          </dt>
          <dd
            className={cx({
              'text-xs': true,
              'text-primary-500': !selected,
              'text-gray-700': selected,
            })}
          >
            {cost}
          </dd>
        </div>
      </dl>

      <div>
        {!pngData && (
          <Loading
            visible
            className="flex items-center justify-center w-full h-full bg-gray-700 bg-opacity-90"
            iconClassName="w-10 h-10 text-primary-500"
          />
        )}
        {pngData && (
          <img className="w-full" src={pngData} alt={`BLM: ${blmValue}`} />
        )}
      </div>
    </div>
  );
};

export default ScenariosBlmResultsCard;
