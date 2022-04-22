import React, { useEffect, useMemo } from 'react';

import { useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import { useProject } from 'hooks/projects';

export interface WebShotStatusProps {

}

globalThis.MARXAN = {
  webshot_ready: false,
};

export const WebShotStatus: React.FC<WebShotStatusProps> = () => {
  const { query } = useRouter();
  const { pid } = query;

  const { maps } = useSelector((state) => state['/reports/frequency']);

  const mapsLoaded = useMemo(() => {
    return Object.keys(maps).every((k) => maps[k]);
  }, [maps]);

  const {
    data: projectData,
    isFetched: projectDataIsFetched,
  } = useProject(pid);

  const reportDataIsFetched = projectData && projectDataIsFetched
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
