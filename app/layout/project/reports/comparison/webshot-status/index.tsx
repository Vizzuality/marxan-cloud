import { useEffect, useMemo } from 'react';

import { useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import { useProject } from 'hooks/projects';

globalThis.MARXAN = {
  webshot_ready: false,
};

export const WebShotStatus: React.FC = () => {
  const { query } = useRouter();
  const { pid } = query as { pid: string };

  const { maps } = useSelector((state) => state['/reports/comparison']);

  const mapsLoaded = useMemo(() => {
    return Object.keys(maps).every((k) => maps[k]);
  }, [maps]);

  const { data: projectData, isFetched: projectDataIsFetched } = useProject(pid);
  // !TODO: Wiat both scenarios to be fetched
  const reportDataIsFetched = projectData && projectDataIsFetched && mapsLoaded;

  useEffect(() => {
    if (reportDataIsFetched) {
      setTimeout(() => {
        globalThis.MARXAN = {
          ...globalThis.MARXAN,
          webshot_ready: true,
        };
      }, 1000);
    }
  }, [reportDataIsFetched]);

  return null;
};

export default WebShotStatus;
