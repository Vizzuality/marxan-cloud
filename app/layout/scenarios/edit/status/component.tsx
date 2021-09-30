import React, {
  useCallback, useEffect, useMemo, useRef,
} from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { motion } from 'framer-motion';

import { useSaveScenario, useScenario, useScenarioStatus } from 'hooks/scenarios';

import Button from 'components/button';
import Icon from 'components/icon';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';
import PROCESSING_SVG from 'svgs/ui/processing.svg?sprite';

import { TEXTS_FAILURE, TEXTS_RUNNING } from './constants';

export interface ScenarioStatusProps {
}

export const ScenarioStatus: React.FC<ScenarioStatusProps> = () => {
  const { query } = useRouter();
  const { pid, sid } = query;

  const dispatch = useDispatch();
  const scenarioSlice = getScenarioEditSlice(sid);
  const {
    setCache,
    setJob,
  } = scenarioSlice.actions;
  const { lastJobTimestamp } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const JOB_RUNNINGREF = useRef(null);

  const { data: scenarioData } = useScenario(sid);
  const { data: scenarioStatusData } = useScenarioStatus(pid, sid);

  const scenarioMutation = useSaveScenario({
    requestConfig: {
      method: 'PATCH',
    },
  });

  // Running
  const JOB_RUNNING = useMemo(() => {
    const { jobs = [] } = scenarioStatusData || {};
    return jobs.find((j) => j.status === 'running');
  }, [scenarioStatusData]);

  const TEXT_RUNNING = useMemo(() => {
    if (JOB_RUNNING && TEXTS_RUNNING[JOB_RUNNING.kind]) {
      return TEXTS_RUNNING[JOB_RUNNING.kind]();
    }

    if (JOB_RUNNING && !TEXTS_RUNNING[JOB_RUNNING.kind]) {
      console.warn(`${JOB_RUNNING.kind} does not have a proper TEXT`);
    }

    return null;
  }, [JOB_RUNNING]);

  // Failure
  const JOB_FAILURE = useMemo(() => {
    const { jobs = [] } = scenarioStatusData || {};
    return jobs.find((j) => {
      const jobTimestamp = new Date(j.isoDate).getTime();
      return j.status === 'failure' && jobTimestamp > scenarioData?.metadata?.scenarioEditingMetadata?.lastJobCheck;
    });
  }, [scenarioStatusData, scenarioData?.metadata?.scenarioEditingMetadata?.lastJobCheck]);

  const TEXT_FAILURE = useMemo(() => {
    if (JOB_FAILURE && TEXTS_FAILURE[JOB_FAILURE.kind]) {
      return TEXTS_FAILURE[JOB_FAILURE.kind]();
    }

    if (JOB_FAILURE && !TEXTS_FAILURE[JOB_FAILURE.kind]) {
      console.warn(`${JOB_FAILURE.kind} does not have a proper TEXT`);
    }

    return null;
  }, [JOB_FAILURE]);

  useEffect(() => {
    if (JOB_RUNNINGREF.current && !JOB_RUNNING) {
      dispatch(setCache(Date.now()));
    }
    JOB_RUNNINGREF.current = JOB_RUNNING;
  }, [JOB_RUNNING]); // eslint-disable-line

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

  const onTryAgain = useCallback(() => {
    scenarioMutation.mutate({
      id: `${sid}`,
      data: {
        metadata: {
          ...scenarioData?.metadata,
          scenarioEditingMetadata: {
            ...scenarioData?.metadata?.scenarioEditingMetadata,
            lastJobCheck: new Date().getTime(),
          },
        },
      },
    }, {
      onSuccess: () => {
        dispatch(setJob(null));
      },
      onError: () => {

      },
    });
  }, [sid, scenarioMutation, scenarioData?.metadata, dispatch, setJob]);

  return (
    <div className="absolute top-0 left-0 z-50 flex flex-col justify-end w-full h-full pointer-events-none">
      {(JOB_RUNNING || JOB_FAILURE) && (
        <motion.div
          className="absolute top-0 left-0 z-10 w-full h-full bg-black bg-opacity-75 pointer-events-auto"
          key="status-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}

      {JOB_RUNNING && (
        <motion.div
          className="absolute z-10 pointer-events-auto top-1/2 left-1/2"
          key="status-text"
          initial={{ opacity: 0, y: '-60%', x: '-50%' }}
          animate={{ opacity: 1, y: '-50%', x: '-50%' }}
        >
          <div className="w-full max-w-md p-10 space-y-5 text-center">
            <h3 className="text-xs tracking-wide uppercase font-heading">{TEXT_RUNNING}</h3>

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
