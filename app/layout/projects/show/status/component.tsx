import React, { useCallback, useEffect, useRef } from 'react';

import { useRouter } from 'next/router';

import { motion } from 'framer-motion';

import { useProject } from 'hooks/projects';
import { useScenariosStatus } from 'hooks/scenarios';

import Button from 'components/button';
import Icon from 'components/icon';
import { Job } from 'types/api/job';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';
import PROCESSING_SVG from 'svgs/ui/processing.svg?sprite';

import { useProjectActionsDone } from './actions/done';
import { useProjectActionsFailure } from './actions/failure';
import {
  useProjectJobs,
  useProjectJobFailure,
  useProjectTextFailure,
  useProjectJobDone,
  useProjectTextDone,
  useProjectJobRunning,
  useProjectTextRunning,
} from './utils';

export interface ProjectStatusProps {}

export const ProjectStatus: React.FC<ProjectStatusProps> = () => {
  const { query } = useRouter();
  const { pid } = query as { pid: string };

  const { data: projectData } = useProject(pid);
  const { data: scenarioStatusData } = useScenariosStatus(pid);

  const { jobs = [] } = scenarioStatusData || {};

  // Jobs
  const JOBS = useProjectJobs(jobs);

  // Failure
  const JOB_FAILURE = useProjectJobFailure(JOBS, new Date(projectData?.lastModifiedAt).getTime());
  const TEXT_FAILURE = useProjectTextFailure(JOB_FAILURE);

  // Done
  const JOB_DONE_REF = useRef<Job>(null);
  const JOB_DONE = useProjectJobDone(JOBS, new Date(projectData?.lastModifiedAt).getTime());
  const TEXT_DONE = useProjectTextDone(JOB_DONE, JOB_DONE_REF);

  // Running
  const JOB_RUNNING = useProjectJobRunning(JOBS, JOB_FAILURE);
  const TEXT_RUNNING = useProjectTextRunning(JOB_RUNNING, JOB_DONE_REF);

  // Actions
  const ACTIONS_DONE = useProjectActionsDone();

  const ACTIONS_FAILURE = useProjectActionsFailure();

  useEffect(() => {
    // If there is a job done execute the actions associated to it
    if (JOB_DONE && !JOB_DONE_REF.current) {
      // Assign the job done to the ref so we can
      // show the correct text while the actions are triggered
      JOB_DONE_REF.current = JOB_DONE;

      // Execute the action
      if (ACTIONS_DONE[JOB_DONE.kind]) {
        ACTIONS_DONE[JOB_DONE.kind](JOB_DONE_REF);
      } else {
        ACTIONS_DONE.default(JOB_DONE_REF);
      }
    }
  }, [ACTIONS_DONE, JOB_DONE]);

  const onCloseFailure = useCallback(() => {
    if (ACTIONS_FAILURE[JOB_FAILURE.kind]) {
      ACTIONS_FAILURE[JOB_FAILURE.kind]();
    } else {
      ACTIONS_FAILURE.default();
    }
  }, [ACTIONS_FAILURE, JOB_FAILURE?.kind]);

  return (
    <div className="pointer-events-none absolute left-0 top-0 z-50 flex h-full w-full flex-col justify-end">
      {(JOB_RUNNING || JOB_FAILURE || JOB_DONE) && (
        <motion.div
          className="pointer-events-auto absolute left-0 top-0 z-10 h-full w-full bg-black bg-opacity-75"
          key="status-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}

      {(JOB_RUNNING || JOB_DONE) && !JOB_FAILURE && (
        <motion.div
          className="pointer-events-auto absolute left-1/2 top-1/2 z-10"
          key="status-text"
          initial={{ opacity: 0, y: '-60%', x: '-50%' }}
          animate={{ opacity: 1, y: '-50%', x: '-50%' }}
        >
          <div className="w-full max-w-md space-y-5 p-10 text-center">
            <h3 className="font-heading text-xs uppercase tracking-wide">
              {TEXT_RUNNING || TEXT_DONE}
            </h3>

            <Icon icon={PROCESSING_SVG} className="m-auto" style={{ width: 40, height: 10 }} />

            <p className="text-center font-heading text-xs tracking-wide">
              This task may take some time.
              <br />
              Meanwhile, you can go to your dashboard and do some other stuff.
            </p>
            <div className="flex justify-center space-x-2">
              <Button theme="primary-alt" size="base" href="/projects" className="w-1/2">
                Go to dashboard
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {JOB_FAILURE && (
        <motion.div
          className="pointer-events-auto absolute left-1/2 top-1/2 z-10"
          key="status-text"
          initial={{ opacity: 0, y: '-60%', x: '-50%' }}
          animate={{ opacity: 1, y: '-50%', x: '-50%' }}
        >
          <div className="w-full max-w-md space-y-5 p-10 text-center">
            <Icon
              icon={CLOSE_SVG}
              className="m-auto text-red-500"
              style={{ width: 20, height: 20 }}
            />

            <h3 className="font-heading text-xs uppercase tracking-wide">{TEXT_FAILURE}</h3>

            <div className="flex justify-center space-x-2">
              <Button theme="primary-alt" size="base" onClick={onCloseFailure}>
                Close
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProjectStatus;
