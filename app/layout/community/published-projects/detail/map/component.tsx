import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';

import { useRouter } from 'next/router';

import { AnimatePresence, motion } from 'framer-motion';

import { usePublishedProject } from 'hooks/projects';
import { useScenarios } from 'hooks/scenarios';

// Map
import Map from 'components/map';

export interface PublishedProjectMapProps {
}

export const PublishedProjectMap: React.FC<PublishedProjectMapProps> = () => {
  const [viewport, setViewport] = useState({});
  const [bounds, setBounds] = useState(null);

  const { query } = useRouter();
  const { pid } = query;
  const { data = {} } = usePublishedProject(pid);
  const {
    id, bbox,
  } = data;

  const {
    data: scenariosData,
    isFetched: scenariosIsFetched,
  } = useScenarios(pid, {
    filters: {
      projectId: pid,
    },
    sort: '-lastModifiedAt',
  });

  const firstSidRunned = useMemo(() => {
    return scenariosData
      .map((s) => {
        if (s.jobs.find((j) => j.kind === 'run' && j.status === 'done')) {
          return {
            id: s.id,
          };
        }

        return null;
      })
      .filter((s) => !!s);
  }, [scenariosData]);

  const sid = scenariosIsFetched && scenariosData && !!scenariosData.length ? firstSidRunned || `${scenariosData[0].id}` : null;

  console.log('sid------->', sid);

  useEffect(() => {
    setBounds({
      bbox,
      options: { padding: 50 },
      viewportOptions: {
        transitionDuration: 0,
      },
    });
  }, [bbox]);

  const handleViewportChange = useCallback((vw) => {
    setViewport(vw);
  }, []);

  return (
    <AnimatePresence>
      {id && (
        <motion.div
          key="project-map"
          className="relative w-full h-full col-span-5 overflow-hidden pointer-events-none rounded-4xl"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
        >
          <Map
            bounds={bounds}
            width="100%"
            height="100%"
            viewport={viewport}
            mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN}
            mapStyle="mapbox://styles/marxan/ckn4fr7d71qg817kgd9vuom4s"
            onMapViewportChange={handleViewportChange}
            doubleClickZoom={false}
            dragPan={false}
          />

        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PublishedProjectMap;
