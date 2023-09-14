import React, { ReactNode, useCallback, useMemo, useState } from 'react';

import cx from 'classnames';

import Button from 'components/button';
import Icon from 'components/icon';
import ProgressBar from 'components/progress-bar';
import Tooltip from 'components/tooltip';

import ARROW_RIGHT_SVG from 'svgs/ui/arrow-right.svg?sprite';
import LOCK_SVG from 'svgs/ui/lock.svg?sprite';
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
  'calibration-running': {
    text: 'Running Calibration',
    styles: 'text-white',
  },
  'calibration-failure': {
    text: 'Fail Running Calibration',
    styles: 'text-red-500',
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
  'clone-running': {
    text: 'Running cloning',
    styles: 'text-white',
  },
  'clone-failure': {
    text: 'Fail cloning scenario',
    styles: 'text-red-500',
  },
  draft: {
    text: 'Edited',
    styles: 'text-gray-100',
  },
};

export interface ItemProps {
  id: string;
  name: string;
  warnings: boolean;
  progress?: number;
  lastUpdate: string;
  jobs?: Record<string, any>[];
  runStatus: 'created' | 'running' | 'done' | 'failure';
  lock?: Record<string, any>;
  lastUpdateDistance: string;
  className?: string;
  ranAtLeastOnce: boolean;
  numberOfRuns: number;
  onEdit: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
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
  jobs,
  runStatus,
  lock,
  ranAtLeastOnce,
  onEdit,
  onCancelRun,
  onDelete,
  onDuplicate,
  SettingsC,
}: ItemProps) => {
  const [settings, setSettings] = useState(false);

  const status = useMemo(() => {
    const planningAreaProtectedCalculation = jobs.find(
      (j) => j.kind === 'planningAreaProtectedCalculation'
    );
    const planningUnitsInclusion = jobs.find((j) => j.kind === 'planningUnitsInclusion');
    const geofeatureCopy = jobs.find((j) => j.kind === 'geofeatureCopy');
    const geofeatureSplit = jobs.find((j) => j.kind === 'geofeatureSplit');
    const geofeatureStratification = jobs.find((j) => j.kind === 'geofeatureStratification');
    const specification = jobs.find((j) => j.kind === 'specification');
    const calibration = jobs.find((j) => j.kind === 'calibration');
    const clone = jobs.find((j) => j.kind === 'clone');
    const run = jobs.find((j) => j.kind === 'run');

    // PROTECTED AREAS
    if (planningAreaProtectedCalculation && planningAreaProtectedCalculation.status === 'running')
      return 'pa-running';
    if (planningAreaProtectedCalculation && planningAreaProtectedCalculation.status === 'failure')
      return 'pa-failure';

    // PLANNING UNITS LOCK
    if (planningUnitsInclusion && planningUnitsInclusion.status === 'running') return 'pu-running';

    // GEO FEATURES
    if (
      (geofeatureCopy && geofeatureCopy.status === 'running') ||
      (geofeatureSplit && geofeatureSplit.status === 'running') ||
      (geofeatureStratification && geofeatureStratification.status === 'running') ||
      (specification && specification.status === 'running')
    )
      return 'features-running';
    if (
      (geofeatureCopy && geofeatureCopy.status === 'failure') ||
      (geofeatureSplit && geofeatureSplit.status === 'failure') ||
      (geofeatureStratification && geofeatureStratification.status === 'failure') ||
      (specification && specification.status === 'failure')
    )
      return 'features-failure';

    // CALIBRATION
    if (calibration && calibration.status === 'running') return 'calibration-running';
    if (calibration && calibration.status === 'failure') return 'calibration-failure';

    // RUN
    if (run && run.status === 'running') return 'run-running';
    if (run && run.status === 'failure') return 'run-failure';
    if (run && run.status === 'done') return 'run-done';

    // RUN STATUS
    if (runStatus === 'running') return 'run-running';
    if (runStatus === 'failure') return 'run-failure';
    if (runStatus === 'done') return 'run-done';

    // CLONE
    if (clone && clone.status === 'running') return 'clone-running';
    if (clone && clone.status === 'failure') return 'clone-failure';

    if (ranAtLeastOnce) return 'run-done';

    return 'draft';
  }, [jobs, runStatus, ranAtLeastOnce]);

  const onSettings = useCallback(() => {
    setSettings(!settings);
  }, [settings]);

  return (
    <div
      className={cx({
        'flex flex-col space-y-0.5 bg-transparent': true,
        [className]: className,
      })}
    >
      <div
        className={cx({
          'flex h-16 space-x-0.5 bg-transparent': true,
        })}
      >
        <div
          className={cx({
            'flex flex-grow flex-col rounded-l-3xl bg-gray-800 pl-8': true,
            'rounded-bl-none': settings,
          })}
        >
          <div className="flex flex-grow items-center pr-5">
            <div className="flex max-h-full flex-grow items-center space-x-4 text-lg text-white">
              <section className="flex-grow">
                <div className="flex flex-row items-center">
                  {warnings && (
                    <div className="relative mr-5 flex h-10 w-10 items-center rounded-full border border-solid border-white">
                      <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-4 border-solid border-gray-800 bg-red-500" />
                      <Icon className="h-10 w-10" icon={WARNING_SVG} />
                    </div>
                  )}

                  <div className="flex items-center space-x-4 leading-none">
                    {lock && (
                      <Tooltip
                        arrow
                        placement="top"
                        content={
                          <div className="rounded bg-white p-2 text-center text-xs text-gray-600">
                            <div>{lock.displayName || lock.email}</div>
                            <div>is editing this scenario</div>
                          </div>
                        }
                      >
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-600">
                          <Icon className="relative w-3 text-white" icon={LOCK_SVG} />
                        </div>
                      </Tooltip>
                    )}
                    <div>
                      <h2 className="line-clamp-1 font-heading text-sm font-medium" title={name}>
                        {name}
                      </h2>

                      <div className="line-clamp-1">
                        <span
                          className={cx({
                            'm-0 inline-block text-xs': true,
                            [SCENARIO_STATES[status].styles]:
                              status !== SCENARIO_STATES[status].text,
                          })}
                        >
                          {`${SCENARIO_STATES[status].text} `}
                        </span>
                        <span
                          className={cx({
                            'ml-1 inline-block text-xs': true,
                            [SCENARIO_STATES[status].styles]:
                              status !== SCENARIO_STATES[status].text,
                          })}
                        >
                          {lastUpdateDistance}
                        </span>
                      </div>
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
                </>
              )}

              {status === 'run-running' && (
                <Button className="flex-shrink-0" size="s" theme="danger-alt" onClick={onCancelRun}>
                  Cancel run
                </Button>
              )}
            </div>
          </div>
          {status.includes('running') && progress && <ProgressBar progress={progress} />}
        </div>

        <button
          type="button"
          onClick={onEdit}
          className={cx({
            'flex-column flex h-full items-center rounded-r-3xl bg-gray-800 px-8': true,
            'text-primary-500 transition-colors hover:bg-primary-500 hover:text-black focus:bg-primary-300 focus:text-black focus:outline-none':
              true,
            'rounded-br-none': settings,
          })}
        >
          <span className="mr-2 text-sm">View</span>
          <Icon className="h-3 w-3" icon={ARROW_RIGHT_SVG} />
        </button>
      </div>

      {settings && (
        <Settings onDelete={onDelete} onDuplicate={onDuplicate}>
          {SettingsC}
        </Settings>
      )}
    </div>
  );
};

export default Item;
