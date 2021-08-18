import React, { useEffect, useMemo, useRef } from 'react';

import { useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { motion } from 'framer-motion';

import { useScenarioStatus } from 'hooks/scenarios';

import Button from 'components/button';

export interface ScenarioStatusProps {
}

const TEXTS = {
  planningAreaProtectedCalculation: () => 'The scenario is calculating the protected areas percentages',
  geofeatureCopy: () => 'The scenario is processing the features',
  planningUnitsInclusion: () => 'The scenario is processing the inclusion/exclusion planning units',
  run: () => 'The scenario is running Marxan',
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
          className="absolute top-0 left-0 z-10 w-full h-full pointer-events-auto bg-blur"
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
          <div className="w-full max-w-md p-10 text-center">
            {TEXT}

            <div className="flex justify-center mt-5 ">
              <Button
                theme="primary-alt"
                size="base"
                href={`/projects/${pid}`}
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
