import React from 'react';

import { useRouter } from 'next/router';

import { useScenario } from 'hooks/scenarios';

import { SCENARIO_PARAMETERS, Types } from './constants';

export interface ScenariosReportPage4Props {

}

export const ScenariosReportPage4: React.FC<ScenariosReportPage4Props> = () => {
  const { query } = useRouter();
  const { sid } = query;

  const {
    data: scenarioData,
    isFetched: scenarioDataIsFetched,
  } = useScenario(sid);

  const { metadata } = scenarioData || {};

  const { marxanInputParameterFile } = metadata || {};

  const {
    BESTSCORE, CLUMPTYPE, COSTTHRESH,
    COOLFAC, HEURTYPE, ITIMPTYPE, MISSLEVEL, NUMTEMP,
    NUMITNS, PROP, RANDSEED, RUNMODE, STARTTEMP,
    THRESHPEN1, VERBOSITY,
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
  };

  return (
    scenarioDataIsFetched && (
      <div className="flex space-x-4">

        <section className="w-1/2 space-y-6 text-xs">
          <div>
            <p className="font-semibold">Feature name, target, spf:</p>
          </div>
        </section>

        <section className="w-1/2 space-y-6 text-xs">

          {SCENARIO_PARAMETERS.map((p) => {
            const { description, value } = p;
            return (
              <div key={p.value} className="flex space-x-2">
                <p className="font-semibold">{`${description} :`}</p>
                <p>{PARAMETERS[value]}</p>
              </div>
            );
          })}
        </section>
      </div>
    )
  );
};

export default ScenariosReportPage4;
