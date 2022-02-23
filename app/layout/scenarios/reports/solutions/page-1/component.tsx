import React from 'react';

import { useRouter } from 'next/router';

import { useProjectUsers } from 'hooks/project-users';
import { useProject } from 'hooks/projects';
import { useScenario, useScenarioPU } from 'hooks/scenarios';
import { useWDPACategories } from 'hooks/wdpa';

import ScenarioReportsMap from 'layout/scenarios/reports/map';

export interface ScenariosReportPage1Props {

}

export const ScenariosReportPage1: React.FC<ScenariosReportPage1Props> = () => {
  const { query } = useRouter();
  const { pid, sid } = query;

  const {
    data: projectData,
    isFetched: projectDataIsFetched,
  } = useProject(pid);

  const {
    data: projectUsers,
    isFetched: projectUsersDataIsFetched,
  } = useProjectUsers(pid);

  const contributors = projectUsers?.map((u) => u.user.displayName);

  const {
    data: scenarioData,
    isFetched: scenarioDataIsFetched,
  } = useScenario(sid);

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

  const reportDataIsFetched = projectDataIsFetched && projectUsersDataIsFetched
    && scenarioDataIsFetched && protectedAreasDataIsFetched && PUDataIsFetched;

  return (
    reportDataIsFetched && (
      <div className="flex space-x-4">

        <section className="w-1/3 space-y-8 text-xs leading-5">
          <div>
            <p className="font-semibold">Contributors</p>
            <p>{contributors.join(', ')}</p>
          </div>

          <div>
            <p className="font-semibold"> Features meeting targets:</p>
          </div>

          <div>
            <p className="font-semibold">Cost surface:</p>
          </div>

          <div>
            <p className="font-semibold">BLM</p>
            <p>{scenarioData.metadata.marxanInputParameterFile.BLM || null}</p>
          </div>

          <div>
            <p className="font-semibold">Protected Areas:</p>
            <p>{protectedAreas.join(', ')}</p>
          </div>

          <div>
            <p className="font-semibold">No. of planning units</p>
            <p>{`In: ${PUData.included.length || 0}`}</p>
            <p>{`Out: ${PUData.excluded.length || 0}`}</p>
          </div>
        </section>

        <ScenarioReportsMap />

      </div>
    )
  );
};

export default ScenariosReportPage1;
