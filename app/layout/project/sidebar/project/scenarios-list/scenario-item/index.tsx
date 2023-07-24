import React, { useCallback, useMemo, useState } from 'react';

import { useRouter } from 'next/router';

import { useCanEditProject } from 'hooks/permissions';

import Button from 'components/button';
import Icon from 'components/icon';
import { Popover, PopoverContent, PopoverTrigger } from 'components/popover';
import ProgressBar from 'components/progress-bar';
import Tooltip from 'components/tooltip';
import { SCENARIO_STATES } from 'layout/project/sidebar/project/scenarios-list/scenario-item/constants';
import ScenarioSettings from 'layout/project/sidebar/project/scenarios-list/scenario-item/settings';
import { Scenario } from 'types/scenario';
import { cn } from 'utils/cn';

import ARROW_RIGHT_SVG from 'svgs/ui/arrow-right.svg?sprite';
import DOTS_SVG from 'svgs/ui/dots.svg?sprite';
import LOCK_SVG from 'svgs/ui/lock.svg?sprite';
import DELETE_SVG from 'svgs/ui/new-layout/delete.svg?sprite';
import DUPLICATE_SVG from 'svgs/ui/new-layout/duplicate.svg?sprite';
import TOGGLE_SCENARIO_SVG from 'svgs/ui/new-layout/toggle-scenario.svg?sprite';
import WARNING_SVG from 'svgs/ui/warning.svg?sprite';

export interface ScenarioItemProps extends Scenario {
  className?: string;
  warnings: boolean;
  onEdit: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onCancelRun?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onDelete?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onDuplicate?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export const ScenarioItem: React.FC<ScenarioItemProps> = ({
  id,
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
}: ScenarioItemProps) => {
  const { query } = useRouter();
  const { pid } = query as { pid: string };
  const editable = useCanEditProject(pid);

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
      className={cn({
        'flex flex-col space-y-0.5 bg-transparent': true,
        [className]: className,
      })}
    >
      <div
        className={cn({
          'flex h-16 space-x-0.5 bg-transparent': true,
        })}
      >
        <div
          className={cn({
            'flex flex-grow flex-col rounded-l-[20px] bg-gray-700 pl-8': true,
            'rounded-bl-none': settings,
          })}
        >
          <div className="flex flex-grow items-center pr-5">
            <div className="flex max-h-full flex-grow items-center space-x-4 text-lg text-white">
              <section className="flex-grow">
                <div className="flex flex-row items-center">
                  {warnings && (
                    <div className="relative mr-5 flex h-10 w-10 items-center rounded-full border border-solid border-white">
                      <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-4 border-solid border-gray-700 bg-red-500" />
                      <Icon className="h-10 w-10" icon={WARNING_SVG} />
                    </div>
                  )}

                  <div className="flex items-center space-x-4 leading-none">
                    {lock && (
                      <Tooltip
                        arrow
                        placement="top"
                        content={
                          <div className="rounded bg-white p-2 text-center text-xs text-gray-500">
                            <div>{lock.displayName || lock.email}</div>
                            <div>is editing this scenario</div>
                          </div>
                        }
                      >
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-500">
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
                          className={cn({
                            'm-0 inline-block text-xs': true,
                            [SCENARIO_STATES[status].styles]:
                              status !== SCENARIO_STATES[status].text,
                          })}
                        >
                          {`${SCENARIO_STATES[status].text} `}
                        </span>
                        <span
                          className={cn({
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
                  <button className="flex-shrink-0" onClick={onSettings}>
                    <Icon
                      className={cn({
                        'h-5 w-5 transition-colors': true,
                        'text-primary-500': settings,
                        'text-gray-400': !settings,
                      })}
                      icon={TOGGLE_SCENARIO_SVG}
                    />
                  </button>
                </>
              )}

              {status !== 'run-running' && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-500">
                      <Icon
                        icon={DOTS_SVG}
                        className={cn({
                          'h-4 w-4 rotate-90 text-white': true,
                        })}
                      />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    side="right"
                    sideOffset={20}
                    className="w-32 rounded-2xl !border-none bg-gray-700 !p-0 font-sans text-xs"
                    collisionPadding={50}
                  >
                    <button
                      className="group flex w-full cursor-pointer items-center space-x-3 rounded-t-2xl px-2.5 py-2 hover:bg-gray-500"
                      disabled={!editable}
                      onClick={onDuplicate}
                    >
                      <Icon
                        className="h-5 w-5 text-gray-500 transition-colors group-hover:text-white"
                        icon={DUPLICATE_SVG}
                      />
                      <p>Duplicate</p>
                    </button>
                    <button
                      className="group flex w-full cursor-pointer items-center space-x-3 rounded-b-2xl px-2.5 py-2 hover:bg-gray-500"
                      disabled={!editable}
                      onClick={onDelete}
                    >
                      <Icon
                        className="h-5 w-5 text-gray-500 transition-colors group-hover:text-white"
                        icon={DELETE_SVG}
                      />
                      <p>Delete</p>
                    </button>
                  </PopoverContent>
                </Popover>
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
          className={cn({
            'flex-column flex h-full items-center rounded-r-[20px] bg-gray-700 px-8': true,
            'text-primary-500 transition-colors hover:bg-primary-500 hover:text-black focus:bg-primary-300 focus:text-black focus:outline-none':
              true,
            'rounded-br-none': settings,
          })}
        >
          <span className="mr-2 text-sm">View</span>
          <Icon className="h-3 w-3" icon={ARROW_RIGHT_SVG} />
        </button>
      </div>
      {settings && <ScenarioSettings id={id} />}
    </div>
  );
};

export default ScenarioItem;
