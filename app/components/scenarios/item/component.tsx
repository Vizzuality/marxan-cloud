import React, {
  ReactNode, useCallback, useMemo, useState,
} from 'react';

import cx from 'classnames';

import Button from 'components/button';
import Icon from 'components/icon';
import ProgressBar from 'components/progress-bar';

import ARROW_RIGHT_SVG from 'svgs/ui/arrow-right.svg?sprite';
import WARNING_SVG from 'svgs/ui/warning.svg?sprite';

import Settings from './settings';

const SCENARIO_STATES = {
  'run-running': {
    text: 'Running Scenario',
    styles: 'text-white',
  },
  'run-failure': {
    text: 'Fail Running Scenario',
    styles: 'text-red-500',
  },
  'run-done': {
    text: 'Run Scenario',
    styles: 'text-green-500',
  },
  'pa-running': {
    text: 'Running PA percentage',
    styles: 'text-white',
  },
  'pa-failure': {
    text: 'Fail PA percentage',
    styles: 'text-red-500',
  },
  'pu-running': {
    text: 'Running PU inclusion',
    styles: 'text-white',
  },
  'pu-failure': {
    text: 'Fail PU inclusion',
    styles: 'text-red-500',
  },
  'features-running': {
    text: 'Running Features',
    styles: 'text-white',
  },
  'features-failure': {
    text: 'Fail Features',
    styles: 'text-red-500',
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
  jobs?: Record<string, unknown>[];
  lastUpdateDistance: string;
  className?: string;
  onEdit: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onView: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onCancelRun?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
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
  jobs = [],
  onEdit,
  onView,
  onCancelRun,
  onDelete,
  onDuplicate,
  SettingsC,
}: ItemProps) => {
  const [settings, setSettings] = useState(false);

  const status = useMemo(() => {
    const planningAreaProtectedCalculation = jobs.find((j) => j.kind === 'planningAreaProtectedCalculation');
    const planningUnitsInclusion = jobs.find((j) => j.kind === 'planningUnitsInclusion');
    const geofeatureCopy = jobs.find((j) => j.kind === 'geofeatureCopy');
    const geofeatureSplit = jobs.find((j) => j.kind === 'geofeatureSplit');
    const geofeatureStratification = jobs.find((j) => j.kind === 'geofeatureStratification');

    const run = jobs.find((j) => j.kind === 'run');

    // PROTECTED AREAS
    if (planningAreaProtectedCalculation && planningAreaProtectedCalculation.status === 'running') return 'pa-running';
    if (planningAreaProtectedCalculation && planningAreaProtectedCalculation.status === 'failure') return 'pa-failure';

    // PLANNING UNITS LOCK
    if (planningUnitsInclusion && planningUnitsInclusion.status === 'running') return 'pu-running';
    if (planningUnitsInclusion && planningUnitsInclusion.status === 'failure') return 'pu-failure';

    // GEO FEATURES
    if (
      (geofeatureCopy && geofeatureCopy.status === 'running')
      || (geofeatureSplit && geofeatureSplit.status === 'running')
      || (geofeatureStratification && geofeatureStratification.status === 'running')
    ) return 'features-running';
    if (
      (geofeatureCopy && geofeatureCopy.status === 'failure')
      || (geofeatureSplit && geofeatureSplit.status === 'failure')
      || (geofeatureStratification && geofeatureStratification.status === 'failure')

    ) return 'features-failure';

    // RUN
    if (run && run.status === 'running') return 'run-running';
    if (run && run.status === 'failure') return 'run-failure';
    if (run && run.status === 'done') return 'run-done';

    return 'draft';
  }, [jobs]);

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

              {status !== 'run-running' && (
                <>
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
                </>
              )}

              {status === 'run-running' && (
                <Button
                  className="flex-shrink-0"
                  size="s"
                  theme="danger-alt"
                  onClick={onCancelRun}
                >
                  Cancel run
                </Button>
              )}
            </div>
          </div>
          {status.includes('running') && progress && <ProgressBar progress={progress} />}
        </div>

        <button
          type="button"
          onClick={onView}
          disabled={status.includes('running')}
          className={cx({
            'flex items-center h-full px-8 bg-gray-700 flex-column rounded-r-3xl focus:outline-blue': true,
            'rounded-br-none': settings,
            'text-primary-500': status === 'run-done',
            'text-gray-400 pointer-events-none': status !== 'run-done',
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
