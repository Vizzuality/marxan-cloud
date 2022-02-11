import { useMemo } from 'react';

import groupBy from 'lodash/groupBy';

import { TEXTS_FAILURE, TEXTS_RUNNING } from './constants';

const getStatus = (arr) => {
  if (arr.some(((d) => d.status === 'failure'))) return 'failure';
  if (arr.some(((d) => d.status === 'running'))) return 'running';
  return 'done';
};

export const useScenarioJobs = (jobs) => {
  return useMemo(() => {
    const groups = groupBy(jobs, (j) => {
      if (['specification', 'featuresWithPuIntersection', 'geofeatureCopy', 'geofeatureSplit', 'geofeatureStratification'].includes(j.kind)) {
        return 'features';
      }

      return j.kind;
    });

    return Object.keys(groups).map((k) => {
      const status = getStatus(groups[k]);
      const isoDate = groups[k].reduce((a, b) => {
        return (a.isoDate > b.isoDate) ? a.isoDate : b.isoDate;
      }, 0);

      return {
        kind: k,
        isoDate,
        status,
      };
    });
  }, [jobs]);
};

export const useScenarioJobFailure = (jobs, lastJobCheck) => {
  return useMemo(() => {
    return jobs.find((j) => {
      const jobTimestamp = new Date(j.isoDate).getTime();
      return j.status === 'failure' && jobTimestamp > lastJobCheck;
    });
  }, [jobs, lastJobCheck]);
};

export const useScenarioTextFailure = (JOB_FAILURE) => {
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

export const useScenarioJobDone = (jobs, lastJobCheck) => {
  return useMemo(() => {
    return jobs.find((j) => {
      const jobTimestamp = new Date(j.isoDate).getTime();
      return j.status === 'done' && jobTimestamp > lastJobCheck;
    });
  }, [jobs, lastJobCheck]);
};

export const useScenarioTextDone = (JOB_DONE, JOB_DONE_REF) => {
  return useMemo(() => {
    if (JOB_DONE && TEXTS_RUNNING[JOB_DONE.kind]) {
      return TEXTS_RUNNING[JOB_DONE.kind || JOB_DONE_REF?.current?.kind]();
    }

    if (JOB_DONE && !TEXTS_RUNNING[JOB_DONE.kind]) {
      console.warn(`${JOB_DONE.kind} does not have a proper TEXT`);
    }

    return null;
  }, [JOB_DONE, JOB_DONE_REF]);
};

export const useScenarioJobRunning = (jobs, JOB_FAILURE) => {
  return useMemo(() => {
    return !JOB_FAILURE && jobs.find((j) => j.status === 'running');
  }, [jobs, JOB_FAILURE]);
};

export const useScenarioTextRunning = (JOB_RUNNING, JOB_DONE_REF) => {
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
