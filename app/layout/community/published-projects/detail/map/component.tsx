import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';

import { useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import { LayerManager, Layer } from '@vizzuality/layer-manager-react';
import { AnimatePresence, motion } from 'framer-motion';

import { usePUGridLayer } from 'hooks/map';
import { usePublishedProject } from 'hooks/projects';
import { useScenarios } from 'hooks/scenarios';

import Map from 'components/map';

export interface PublishedProjectMapProps {
}

export const PublishedProjectMap: React.FC<PublishedProjectMapProps> = () => {
  const [viewport, setViewport] = useState({});
  const [bounds, setBounds] = useState(null);

  const { query } = useRouter();
  const { pid } = query;

  const minZoom = 2;
  const maxZoom = 20;

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

  const {
    layerSettings,
  } = useSelector((state) => state['/projects/[id]']);

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

  const PUGridLayer = usePUGridLayer({
    active: scenariosIsFetched && scenariosData && !!scenariosData.length,
    sid: `${sid}`,
    include: 'results',
    sublayers: firstSidRunned ? ['solutions'] : [],
    options: {
      settings: {
        pugrid: layerSettings.pugrid,
        'wdpa-percentage': layerSettings['wdpa-percentage'],
        cost: layerSettings.cost,
        'lock-in': layerSettings['lock-in'],
        'lock-out': layerSettings['lock-out'],
        frequency: layerSettings.frequency,
        solution: layerSettings.solution,
      },
    },
  });

  const LAYERS = [PUGridLayer].filter((l) => !!l);

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
            minZoom={minZoom}
            maxZoom={maxZoom}
            viewport={viewport}
            mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN}
            mapStyle="mapbox://styles/marxan/ckn4fr7d71qg817kgd9vuom4s"
            onMapViewportChange={handleViewportChange}
          // doubleClickZoom={false}
          // dragPan={false}
          >
            {(map) => {
              return (
                <LayerManager map={map} plugin={PluginMapboxGl}>
                  {LAYERS.map((l) => (
                    <Layer key={l.id} {...l} />
                  ))}
                </LayerManager>
              );
            }}

          </Map>

        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PublishedProjectMap;
