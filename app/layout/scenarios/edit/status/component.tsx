import React, { useEffect, useMemo, useRef } from 'react';

import { useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { motion } from 'framer-motion';

import { useScenarioStatus } from 'hooks/scenarios';

import Button from 'components/button';
import Icon from 'components/icon';

import PROCESSING_SVG from 'svgs/ui/processing.svg?sprite';

export interface ScenarioStatusProps {
}

const TEXTS = {
  planningAreaProtectedCalculation: () => 'Calculating the protected areas percentages...',
  specification: () => 'Processing the features...',
  geofeatureCopy: () => 'Processing the features...',
  geofeatureSplit: () => 'Processing the features...',
  geofeatureStrat: () => 'Processing the features...',
  planningUnitsInclusion: () => 'Processing inclusion/exclusion of planning units...',
  run: () => 'Running Marxan...',
};

export const ScenarioStatus: React.FC<ScenarioStatusProps> = () => {
  const { query } = useRouter();
  const { pid, sid } = query;

  const scenarioSlice = getScenarioEditSlice(sid);
  const {
    setCache,
  } = scenarioSlice.actions;

  const dispatch = useDispatch();

  const JOBREF = useRef(null);

  const { data } = useScenarioStatus(pid, sid);

  const JOB = useMemo(() => {
    const { jobs = [] } = data || {};
    return jobs.find((j) => j.status === 'running');
  }, [data]);

  const TEXT = useMemo(() => {
    if (JOB && TEXTS[JOB.kind]) {
      return TEXTS[JOB.kind]();
    }

    if (JOB && !TEXTS[JOB.kind]) {
      console.warn(`${JOB.kind} does not have a proper TEXT`);
    }

    return null;
  }, [JOB]);

  useEffect(() => {
    if (JOBREF.current && !JOB) {
      dispatch(setCache(Date.now()));
    }
    JOBREF.current = JOB;
  }, [JOB]); // eslint-disable-line

  return (
    <div className="absolute top-0 left-0 z-50 flex flex-col justify-end w-full h-full pointer-events-none">
      {JOB && (
        <motion.div
          className="absolute top-0 left-0 z-10 w-full h-full bg-black bg-opacity-75 pointer-events-auto"
          key="status-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}

      {JOB && (
        <motion.div
          className="absolute z-10 pointer-events-auto top-1/2 left-1/2"
          key="status-text"
          initial={{ opacity: 0, y: '-60%', x: '-50%' }}
          animate={{ opacity: 1, y: '-50%', x: '-50%' }}
        >
          <div className="w-full max-w-md p-10 space-y-5 text-center">
            <h3 className="text-xs tracking-wide uppercase font-heading">{TEXT}</h3>

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
    </div>
  );
};

export default ScenarioStatus;
