import React, { useEffect, useMemo } from 'react';

import { useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import { useSelectedFeatures } from 'hooks/features';
import { useProjectUsers } from 'hooks/project-users';
import { useProject } from 'hooks/projects';
import { useCostSurfaceRange, useScenario, useScenarioPU } from 'hooks/scenarios';
import { useWDPACategories } from 'hooks/wdpa';

export interface WebShotStatusProps {

}

globalThis.MARXAN = {
  webshot_ready: false,
};

export const WebShotStatus: React.FC<WebShotStatusProps> = () => {
  const { query } = useRouter();
  const { pid, sid } = query;

  const { maps } = useSelector((state) => state['/reports/solutions']);

  const mapsLoaded = useMemo(() => {
    return Object.keys(maps).every((k) => maps[k]);
  }, [maps]);

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
    && costSurfaceRangeData && costSurfaceRangeDataIsFetched
    && mapsLoaded;

  useEffect(() => {
    if (reportDataIsFetched) {
      setTimeout(() => {
        globalThis.MARXAN = {
          ...globalThis.MARXAN,
          webshot_ready: true,
        };
      }, 5000);
    }
  }, [reportDataIsFetched]);

  return null;
};

export default WebShotStatus;
