import React from 'react';

import Image from 'next/image';
import { useRouter } from 'next/router';

import { useScenario, useScenarioCalibrationResults } from 'hooks/scenarios';

import {
  SCENARIO_PARAMETERS,
  Types,
} from 'layout/scenarios/reports/solutions/advanced-settings/constants';

export const AdvancedSettingsPage = (): JSX.Element => {
  const { query } = useRouter();
  const { sid } = query as { sid: string };

  const calibrationResultsQuery = useScenarioCalibrationResults(sid);

  const { data: scenarioData } = useScenario(sid);

  const { metadata } = scenarioData || {};

  const { marxanInputParameterFile } = metadata || {};

  const {
    BESTSCORE,
    CLUMPTYPE,
    COSTTHRESH,
    COOLFAC,
    HEURTYPE,
    ITIMPTYPE,
    MISSLEVEL,
    NUMTEMP,
    NUMITNS,
    PROP,
    RANDSEED,
    RUNMODE,
    STARTTEMP,
    THRESHPEN1,
    VERBOSITY,
    BLM,
    NUMREPS,
  } = marxanInputParameterFile || {};

  const PARAMETERS = {
    [Types.MISSLEVEL]: MISSLEVEL,
    [Types.PROP]: PROP,
    [Types.RANDSEED]: RANDSEED,
    [Types.BESTSCORE]: BESTSCORE,
    [Types.NUMITNS]: NUMITNS,
    [Types.STARTTEMP]: STARTTEMP,
    [Types.COOLFAC]: COOLFAC,
    [Types.NUMTEMP]: NUMTEMP,
    [Types.COSTTHRESH]: COSTTHRESH,
    [Types.THRESHPEN1]: THRESHPEN1,
    [Types.VERBOSITY]: VERBOSITY,
    [Types.RUNMODE]: RUNMODE,
    [Types.ITIMPTYPE]: ITIMPTYPE,
    [Types.HEURTYPE]: HEURTYPE,
    [Types.CLUMPTYPE]: CLUMPTYPE,
    [Types.BLM]: BLM,
    [Types.NUMREPS]: NUMREPS,
  };

  return (
    <div className="mt-10 flex w-full">
      <div className="flex w-7/12 flex-col space-y-4 text-sm leading-6">
        {SCENARIO_PARAMETERS.map((p) => {
          const { description, value } = p;
          return (
            <div key={p.value} className="flex">
              <p className="text-left font-semibold">
                {description}: <span className="font-normal"> {PARAMETERS[value]}</span>
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex w-5/12 flex-col space-y-2">
        {calibrationResultsQuery.data?.map((cr) => {
          return (
            <div key={cr.scenarioId} className="flex space-x-3 bg-gray-600">
              <Image src={cr.pngData} alt="Blm Image" width={115} height={115} />
              <div className="flex flex-col space-y-2 py-2 text-sm">
                <div>
                  <p className="font-medium uppercase text-white">BLM:</p>
                  <p className="text-primary-500">{cr.blmValue}</p>
                </div>
                <div>
                  <p className="font-medium uppercase text-white">COST:</p>
                  <p className="text-primary-500">{cr.cost}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdvancedSettingsPage;
