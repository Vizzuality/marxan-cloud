import React, { ReactNode, useCallback, useState } from 'react';

import cx from 'classnames';

import Button from 'components/button';
import Icon from 'components/icon';
import ProgressBar from 'components/progress-bar';

import ARROW_RIGHT_SVG from 'svgs/ui/arrow-right.svg?sprite';
import WARNING_SVG from 'svgs/ui/warning.svg?sprite';

import Settings from './settings';

const SCENARIO_STATES = {
  running: {
    text: 'Running Scenario',
    styles: 'text-white',
  },
  completed: {
    text: 'Added',
    styles: 'text-gray-400',
  },
  draft: {
    text: 'Edited',
    styles: 'text-gray-400',
  },
};

export interface ItemProps {
  id: string;
  name: string;
  warnings: boolean;
  progress?: number;
  lastUpdate: string;
  lastUpdateDistance: string;
  className?: string;
  status?: 'running' | 'completed' | 'draft';
  onEdit: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onView: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onDelete?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onDuplicate?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  SettingsC?: ReactNode;
}

export const Item: React.FC<ItemProps> = ({
  name,
  warnings,
  progress,
  lastUpdateDistance,
  className,
  status = 'draft',
  onEdit,
  onView,
  onDelete,
  onDuplicate,
  SettingsC,
}: ItemProps) => {
  const [settings, setSettings] = useState(false);

  const onSettings = useCallback(() => {
    setSettings(!settings);
  }, [settings]);

  return (
    <div className={cx({
      'flex flex-col space-y-0.5 bg-transparent': true,
      [className]: className,
    })}
    >
      <div
        className={cx({
          'flex space-x-0.5 bg-transparent h-16': true,
        })}
      >
        <div
          className={cx({
            'flex flex-col flex-grow pl-8 bg-gray-700 rounded-l-3xl': true,
            'rounded-bl-none': settings,
          })}
        >
          <div className="flex items-center flex-grow pr-5">
            <div className="flex items-center flex-grow max-h-full space-x-4 text-lg text-white">
              <section className="flex-grow">
                <div className="flex flex-row items-center">
                  {warnings && (
                    <div className="relative flex items-center w-10 h-10 mr-5 border border-white border-solid rounded-full">
                      <div className="absolute w-4 h-4 bg-red-500 border-4 border-gray-700 border-solid rounded-full -top-1 -right-1" />
                      <Icon className="w-10 h-10" icon={WARNING_SVG} />
                    </div>
                  )}

                  <div className="leading-none">
                    <h2
                      className="text-sm font-medium font-heading clamp-1"
                      title={name}
                    >
                      {name}
                    </h2>

                    <div className="clamp-1">
                      <span
                        className={cx({
                          'm-0 text-xs inline-block': true,
                          [SCENARIO_STATES[status].styles]:
                            status !== SCENARIO_STATES[status].text,
                        })}
                      >
                        {`${SCENARIO_STATES[status].text} `}
                      </span>
                      <span
                        className={cx({
                          'ml-1 text-xs inline-block': true,
                          [SCENARIO_STATES[status].styles]:
                            status !== SCENARIO_STATES[status].text,
                        })}
                      >
                        {lastUpdateDistance}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <Button
                className="flex-shrink-0"
                size="s"
                theme={settings ? 'white' : 'secondary'}
                onClick={onSettings}
              >
                {settings && 'Close'}
                {!settings && 'Settings'}
              </Button>

              <Button
                className="flex-shrink-0"
                size="s"
                theme="primary"
                onClick={onEdit}
              >
                Edit
              </Button>
            </div>
          </div>
          {status === 'running' && progress && <ProgressBar progress={progress} />}
        </div>

        <button
          type="button"
          onClick={onView}
          disabled={status !== 'completed'}
          className={cx({
            'flex items-center h-full px-8 bg-gray-700 flex-column rounded-r-3xl focus:outline-blue': true,
            'rounded-br-none': settings,
            'text-primary-500 cursor-pointer': status === 'completed',
            'text-gray-400 pointer-events-none': status !== 'completed',
          })}
        >
          <span className="mr-2 text-sm">View</span>
          <Icon className="w-3 h-3" icon={ARROW_RIGHT_SVG} />
        </button>
      </div>

      {settings && (
        <Settings
          onDelete={onDelete}
          onDuplicate={onDuplicate}
        >
          {SettingsC}
        </Settings>
      )}

    </div>
  );
};

export default Item;
