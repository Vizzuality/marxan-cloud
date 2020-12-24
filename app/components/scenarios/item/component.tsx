import React from 'react';
import cx from 'classnames';
import { formatDistanceToNow } from 'date-fns';

import Button from 'components/button';
import ProgressBar from 'components/progress-bar';
import Icon from 'components/icon';
import ARROW_LEFT_SVG from 'svgs/ui/arrow-right.svg';
import WARNING_SVG from 'svgs/ui/bang.svg';

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
  updatedAt: string;
  className?: string;
  scenarioState: 'running' | 'completed' | 'draft';
  onEdit: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onView: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onSettings: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export const Item: React.FC<ItemProps> = ({
  name,
  warnings,
  progress,
  updatedAt = '2020-04-11T10:20:30Z',
  className,
  scenarioState,
  onEdit,
  onView,
  onSettings,
}: ItemProps) => (
  <div
    className={cx({
      'flex space-x-0.5 bg-transparent h-20': true,
      [className]: !!className,
    })}
  >
    <div className="flex flex-col flex-grow pl-8 bg-gray-700 rounded-l-3xl">
      <div className="flex items-center flex-grow pr-5 bg-gray-700 rounded-l-3xl">
        <div className="flex items-center flex-grow max-h-full space-x-4 text-lg text-white">
          <section className="flex-grow">
            <div className="flex flex-row items-center">
              <div>
                {warnings && (
                  <div className="relative flex items-center w-10 h-10 mr-5 border border-white border-solid rounded-full">
                    <div className="absolute w-4 h-4 bg-red-500 border-4 border-black border-solid rounded-full -top-1 -right-1" />
                    <Icon className="w-10 h-10" icon={WARNING_SVG} />
                  </div>
                )}
              </div>
              <div>
                <h2 className="m-0 font-medium font-heading clamp-1">{name}</h2>
                <div className="clamp-1">
                  <span
                    className={cx({
                      'font-normal m-0': true,
                      [SCENARIO_STATES[scenarioState].styles]:
                        scenarioState !== SCENARIO_STATES[scenarioState].text,
                    })}
                  >
                    {`${SCENARIO_STATES[scenarioState].text} `}
                  </span>
                  <span
                    className={cx({
                      'font-normal m-0': true,
                      [SCENARIO_STATES[scenarioState].styles]:
                        scenarioState !== SCENARIO_STATES[scenarioState].text,
                    })}
                  >
                    {formatDistanceToNow(new Date(updatedAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </section>
          <Button size="s" theme="secondary" onClick={onSettings}>
            View settings
          </Button>
          <Button size="s" theme="primary" onClick={onEdit}>
            Edit
          </Button>
        </div>
      </div>
      {scenarioState === 'running' && progress && (
        <ProgressBar progress={progress} />
      )}
    </div>
    <button
      type="button"
      onClick={onView}
      className={cx({
        'flex items-center h-full px-8 bg-gray-700 text-primary-500 flex-column rounded-r-3xl focus:outline-blue': true,
        'text-gray-400 pointer-events-none': scenarioState !== 'completed',
      })}
    >
      <span className="mr-2">View</span>
      <Icon className="w-3 h-3" icon={ARROW_LEFT_SVG} />
    </button>
  </div>
);

export default Item;
