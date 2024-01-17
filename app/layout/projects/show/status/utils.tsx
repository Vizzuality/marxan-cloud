import { MutableRefObject, useMemo } from 'react';

import groupBy from 'lodash/groupBy';

import { Job } from 'types/api/job';

import { TEXTS_FAILURE, TEXTS_RUNNING } from './constants';

const getStatus = (arr: Job[]): Job['status'] => {
  if (arr.some((d) => d.status === 'failure')) return 'failure';
  if (arr.some((d) => d.status === 'running')) return 'running';
  return 'done';
};

export const useProjectJobs = (jobs): Job[] => {
  return useMemo(() => {
    const groups = groupBy(jobs, (j) => {
      if (
        [
          'featuresWithPuIntersection',
          'specification',
          'geofeatureCopy',
          'geofeatureSplit',
          'geofeatureStrat',
        ].includes(j.kind)
      ) {
        return 'features';
      }

      return j.kind;
    });

    return Object.keys(groups).map((k) => {
      const status = getStatus(groups[k]);
      const isoDate = groups[k].reduce((a, b) => {
        return a.isoDate > b.isoDate ? a.isoDate : b.isoDate;
      }, 0);

      return {
        kind: k,
        isoDate,
        status,
      };
    });
  }, [jobs]);
};

export const useProjectJobFailure = (jobs: Job[], lastJobCheck: number) => {
  return useMemo(() => {
    return jobs.find((j) => {
      const jobTimestamp = new Date(j.isoDate).getTime();
      return j.status === 'failure' && jobTimestamp > lastJobCheck;
    });
  }, [jobs, lastJobCheck]);
};

export const useProjectTextFailure = (JOB_FAILURE: Job) => {
  return useMemo(() => {
    if (JOB_FAILURE && TEXTS_FAILURE[JOB_FAILURE.kind]) {
      return TEXTS_FAILURE[JOB_FAILURE.kind]();
    }

    if (JOB_FAILURE && !TEXTS_FAILURE[JOB_FAILURE.kind]) {
      console.warn(`${JOB_FAILURE.kind} does not have a proper TEXT`);
    }

    return null;
  }, [JOB_FAILURE]);
};

export const useProjectJobDone = (jobs: Job[], lastJobCheck: number) => {
  return useMemo(() => {
    return jobs.find((j) => {
      const jobTimestamp = new Date(j.isoDate).getTime();
      return j.status === 'done' && jobTimestamp > lastJobCheck;
    });
  }, [jobs, lastJobCheck]);
};

export const useProjectJobRunning = (jobs: Job[], JOB_FAILURE: Job) => {
  return useMemo(() => {
    return !JOB_FAILURE && jobs.find((j) => j.status === 'running');
  }, [jobs, JOB_FAILURE]);
};

export const useProjectTextRunning = (JOB_RUNNING: Job, JOB_DONE_REF: MutableRefObject<Job>) => {
  return useMemo(() => {
    if (JOB_RUNNING && TEXTS_RUNNING[JOB_RUNNING.kind]) {
      return TEXTS_RUNNING[JOB_RUNNING.kind || JOB_DONE_REF?.current?.kind]();
    }

    if (JOB_RUNNING && !TEXTS_RUNNING[JOB_RUNNING.kind]) {
      console.warn(`${JOB_RUNNING.kind} does not have a proper TEXT`);
    }

    return null;
  }, [JOB_RUNNING, JOB_DONE_REF]);
};
