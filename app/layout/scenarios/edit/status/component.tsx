import React, {
  useCallback, useEffect, useMemo, useRef,
} from 'react';

import { useSelector } from 'react-redux';

import groupBy from 'lodash/groupBy';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { motion } from 'framer-motion';

import { useSaveScenario, useScenario, useScenarioStatus } from 'hooks/scenarios';

import Button from 'components/button';
import Icon from 'components/icon';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';
import PROCESSING_SVG from 'svgs/ui/processing.svg?sprite';

import { useScenarioStatusDone } from './actions/done';
import { useScenarioStatusFailure } from './actions/failure';
import { TEXTS_FAILURE, TEXTS_RUNNING } from './constants';

export interface ScenarioStatusProps {
}

export const ScenarioStatus: React.FC<ScenarioStatusProps> = () => {
  const { query } = useRouter();
  const { pid, sid } = query;

  getScenarioEditSlice(sid);
  const { lastJobTimestamp } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const { data: scenarioData } = useScenario(sid);
  const { data: scenarioStatusData } = useScenarioStatus(pid, sid);

  const scenarioMutation = useSaveScenario({
    requestConfig: {
      method: 'PATCH',
    },
  });

  const DONE = useScenarioStatusDone();
  const FAILURE = useScenarioStatusFailure();

  const getStatus = useCallback((arr) => {
    if (arr.some(((d) => d.status === 'failure'))) return 'failure';
    if (arr.some(((d) => d.status === 'running'))) return 'running';
    return 'done';
  }, []);

  const JOBS = useMemo(() => {
    const { jobs = [] } = scenarioStatusData || {};

    const groups = groupBy(jobs, (j) => {
      if (['specification', 'geofeatureCopy', 'geofeatureSplit', 'geofeatureStrat'].includes(j.kind)) {
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
  }, [scenarioStatusData, getStatus]);

  // Failure
  const JOB_FAILURE = useMemo(() => {
    return JOBS.find((j) => {
      const jobTimestamp = new Date(j.isoDate).getTime();
      return j.status === 'failure' && jobTimestamp > scenarioData?.metadata?.scenarioEditingMetadata?.lastJobCheck;
    });
  }, [JOBS, scenarioData?.metadata?.scenarioEditingMetadata?.lastJobCheck]);

  const TEXT_FAILURE = useMemo(() => {
    if (JOB_FAILURE && TEXTS_FAILURE[JOB_FAILURE.kind]) {
      return TEXTS_FAILURE[JOB_FAILURE.kind]();
    }

    if (JOB_FAILURE && !TEXTS_FAILURE[JOB_FAILURE.kind]) {
      console.warn(`${JOB_FAILURE.kind} does not have a proper TEXT`);
    }

    return null;
  }, [JOB_FAILURE]);

  // Done
  const JOB_DONE_REF = useRef(null);
  const JOB_DONE = useMemo(() => {
    return JOBS.find((j) => {
      const jobTimestamp = new Date(j.isoDate).getTime();
      return j.status === 'done' && jobTimestamp > scenarioData?.metadata?.scenarioEditingMetadata?.lastJobCheck;
    });
  }, [JOBS, scenarioData?.metadata?.scenarioEditingMetadata?.lastJobCheck]);

  const TEXT_DONE = useMemo(() => {
    if (JOB_DONE && TEXTS_RUNNING[JOB_DONE.kind]) {
      return TEXTS_RUNNING[JOB_DONE.kind || JOB_DONE_REF?.current?.kind]();
    }

    if (JOB_DONE && !TEXTS_RUNNING[JOB_DONE.kind]) {
      console.warn(`${JOB_DONE.kind} does not have a proper TEXT`);
    }

    return null;
  }, [JOB_DONE]);

  // Running
  const JOB_RUNNING = useMemo(() => {
    return !JOB_FAILURE && JOBS.find((j) => j.status === 'running');
  }, [JOBS, JOB_FAILURE]);

  const TEXT_RUNNING = useMemo(() => {
    if (JOB_RUNNING && TEXTS_RUNNING[JOB_RUNNING.kind]) {
      return TEXTS_RUNNING[JOB_RUNNING.kind || JOB_DONE_REF?.current?.kind]();
    }

    if (JOB_RUNNING && !TEXTS_RUNNING[JOB_RUNNING.kind]) {
      console.warn(`${JOB_RUNNING.kind} does not have a proper TEXT`);
    }

    return null;
  }, [JOB_RUNNING]);

  useEffect(() => {
    if (lastJobTimestamp) {
      scenarioMutation.mutate({
        id: `${sid}`,
        data: {
          metadata: {
            ...scenarioData?.metadata,
            scenarioEditingMetadata: {
              ...scenarioData?.metadata?.scenarioEditingMetadata,
              lastJobCheck: lastJobTimestamp,
            },
          },
        },
      });
    }
  }, [lastJobTimestamp]); // eslint-disable-line

  useEffect(() => {
    if (JOB_DONE && !JOB_DONE_REF.current) {
      JOB_DONE_REF.current = JOB_DONE;
      DONE[JOB_DONE.kind](JOB_DONE_REF);
    }
  }, [DONE, JOB_DONE]);

  const onTryAgain = useCallback(() => {
    FAILURE[JOB_FAILURE.kind]();
  }, [FAILURE, JOB_FAILURE?.kind]);

  return (
    <div className="absolute top-0 left-0 z-50 flex flex-col justify-end w-full h-full pointer-events-none">
      {(JOB_RUNNING || JOB_FAILURE || JOB_DONE) && (
        <motion.div
          className="absolute top-0 left-0 z-10 w-full h-full bg-black bg-opacity-75 pointer-events-auto"
          key="status-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}

      {((JOB_RUNNING || JOB_DONE) && !JOB_FAILURE) && (
        <motion.div
          className="absolute z-10 pointer-events-auto top-1/2 left-1/2"
          key="status-text"
          initial={{ opacity: 0, y: '-60%', x: '-50%' }}
          animate={{ opacity: 1, y: '-50%', x: '-50%' }}
        >
          <div className="w-full max-w-md p-10 space-y-5 text-center">
            <h3 className="text-xs tracking-wide uppercase font-heading">{TEXT_RUNNING || TEXT_DONE}</h3>

            <Icon icon={PROCESSING_SVG} className="m-auto" style={{ width: 40, height: 10 }} />

            <p className="text-xs tracking-wide text-center font-heading">
              This task may take some time.
              <br />
              Meanwhile, you can go to the project and do some other stuff.
            </p>
            <div className="flex justify-center space-x-2">
              {/* <Button
                theme="danger"
                size="base"
                className="w-1/2"
              >
                Cancel
              </Button> */}

              <Button
                theme="primary-alt"
                size="base"
                href={`/projects/${pid}`}
                className="w-1/2"
              >
                Go to project
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {JOB_FAILURE && (
        <motion.div
          className="absolute z-10 pointer-events-auto top-1/2 left-1/2"
          key="status-text"
          initial={{ opacity: 0, y: '-60%', x: '-50%' }}
          animate={{ opacity: 1, y: '-50%', x: '-50%' }}
        >
          <div className="w-full max-w-md p-10 space-y-5 text-center">
            <Icon icon={CLOSE_SVG} className="m-auto text-red-500" style={{ width: 20, height: 20 }} />

            <h3 className="text-xs tracking-wide uppercase font-heading">{TEXT_FAILURE}</h3>

            <div className="flex justify-center space-x-2">
              <Button
                theme="primary-alt"
                size="base"
                onClick={onTryAgain}
              >
                Try again
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ScenarioStatus;
