import React, { useEffect } from 'react';

import { useRouter } from 'next/router';

import { useSelectedFeatures } from 'hooks/features';
import { useProjectUsers } from 'hooks/project-users';
import { useProject } from 'hooks/projects';
import { useCostSurfaceRange, useScenario, useScenarioPU } from 'hooks/scenarios';
import { useWDPACategories } from 'hooks/wdpa';

export interface WebShootStatusProps {

}

export const WebShootStatus: React.FC<WebShootStatusProps> = () => {
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

  const {
    data: PUData,
    isFetched: PUDataIsFetched,
  } = useScenarioPU(sid);

  const {
    data: featuresData,
    isFetched: featuresDataIsFetched,
  } = useSelectedFeatures(sid, {});

  const {
    data: costSurfaceRangeData,
    isFetched: costSurfaceRangeDataIsFetched,
  } = useCostSurfaceRange(sid);

  const reportDataIsFetched = projectData && projectDataIsFetched
    && projectUsers && projectUsersDataIsFetched
    && scenarioData && scenarioDataIsFetched
    && protectedAreasData && protectedAreasDataIsFetched
    && PUData && PUDataIsFetched
    && featuresData && featuresDataIsFetched
    && costSurfaceRangeData && costSurfaceRangeDataIsFetched;

  useEffect(() => {
    if (reportDataIsFetched) {
      setTimeout(() => {
        globalThis.MARXAN = {
          webshoot_ready: true,
        };
        console.log('---->', globalThis.MARXAN);
      }, 3000);
    } else if (!reportDataIsFetched) {
      globalThis.MARXAN = {
        webshoot_ready: false,
      };
    }
  }, [reportDataIsFetched]);

  return (
    <div>
      { }
    </div>
  );
};

export default WebShootStatus;
