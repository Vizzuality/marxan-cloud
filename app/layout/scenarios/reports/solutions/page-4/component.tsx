import React from 'react';

import { useRouter } from 'next/router';

import { useSelectedFeatures } from 'hooks/features';
import { useProject } from 'hooks/projects';
import { useScenario, useScenarioPU, useCostSurfaceRange } from 'hooks/scenarios';
import { useWDPACategories } from 'hooks/wdpa';

import { SCENARIO_PARAMETERS, Types } from './constants';

export interface ScenariosReportPage4Props {

}

export const ScenariosReportPage4: React.FC<ScenariosReportPage4Props> = () => {
  const { query } = useRouter();
  const { pid, sid } = query;

  const {
    data: projectData,
    isFetched: projectDataIsFetched,
  } = useProject(pid);

  const {
    data: featuresData,
    isFetched: featuresDataIsFetched,
  } = useSelectedFeatures(sid, {});

  const {
    data: costSurfaceRangeData,
    isFetched: costSurfaceRangeDataIsFetched,
  } = useCostSurfaceRange(sid);

  const {
    data: protectedAreasData,
    isFetched: protectedAreasDataIsFetched,
  } = useWDPACategories({
    adminAreaId: projectData?.adminAreaLevel2Id
      || projectData?.adminAreaLevel1I
      || projectData?.countryId,
    customAreaId: !projectData?.adminAreaLevel2Id
      && !projectData?.adminAreaLevel1I
      && !projectData?.countryId ? projectData?.planningAreaId : null,
    scenarioId: sid,
  });

  const protectedAreas = protectedAreasData?.filter((a) => a.selected).map((a) => a.name);

  const {
    data: PUData,
    isFetched: PUDataIsFetched,
  } = useScenarioPU(sid);

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
    THRESHPEN1, VERBOSITY, BLM, NUMREPS,
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

  const reportDataIsFetched = scenarioDataIsFetched && featuresDataIsFetched
    && protectedAreasDataIsFetched && projectDataIsFetched && PUDataIsFetched
    && costSurfaceRangeDataIsFetched;

  return (
    reportDataIsFetched && (
      <div className="flex space-x-4 font-heading">

        <section className="w-1/2 space-y-8 text-xs">
          <div>
            <p className="pb-2 font-medium">Feature name, target, spf:</p>
            {featuresData.map((f) => {
              const { featureId, name, marxanSettings: { fpf: spf, prop: target } } = f;
              return (
                <p key={featureId}>{`${name}, ${target * 100}%, ${spf}`}</p>
              );
            })}
          </div>

          <div className="space-y-2">
            <p className="font-medium">Protected Areas:</p>
            <p>{protectedAreas.join(', ')}</p>
          </div>

          <div className="space-y-2">
            <p className="font-medium">No. planning units locked out:</p>
            <p>{PUData.excluded.length || 0}</p>
          </div>

          <div className="space-y-2">
            <p className="font-medium">Range of cost surface values:</p>
            <p>{`${costSurfaceRangeData.min} - ${costSurfaceRangeData.max}`}</p>
          </div>

          <div className="space-y-2">
            <p className="font-medium">Number of Runs:</p>
            <p>{NUMREPS}</p>
          </div>

          <div className="space-y-2">
            <p className="font-medium">BLM:</p>
            <p>{BLM}</p>
          </div>
        </section>

        <section className="w-1/2 text-xs leading-7">
          {SCENARIO_PARAMETERS.map((p) => {
            const { description, value } = p;
            return (
              <div key={p.value} className="flex">
                <p className="font-medium">
                  {description}
                  :
                  {' '}
                  <span>
                    {' '}
                    {PARAMETERS[value]}
                  </span>
                </p>

              </div>
            );
          })}
        </section>
      </div>
    )
  );
};

export default ScenariosReportPage4;
