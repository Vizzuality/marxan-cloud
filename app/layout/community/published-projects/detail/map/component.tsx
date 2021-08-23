import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';

import { useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import { LayerManager, Layer } from '@vizzuality/layer-manager-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSession } from 'next-auth/client';

import { usePUGridLayer } from 'hooks/map';
import { usePublishedProject } from 'hooks/projects';
import { useScenarios } from 'hooks/scenarios';

import Map from 'components/map';
import Controls from 'components/map/controls';
import FitBoundsControl from 'components/map/controls/fit-bounds';
import ZoomControl from 'components/map/controls/zoom';

export interface PublishedProjectMapProps {
}

export const PublishedProjectMap: React.FC<PublishedProjectMapProps> = () => {
  const [viewport, setViewport] = useState({});
  const [bounds, setBounds] = useState(null);
  const [session] = useSession();

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

  const sid = scenariosIsFetched && scenariosData && !!scenariosData.length ? `${firstSidRunned[0].id}` || `${scenariosData[0].id}` : null;

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
    console.log('VIEWPORT', vw);
    setViewport(vw);
  }, []);

  const handleZoomChange = useCallback(
    (zoom) => {
      setViewport({
        ...viewport,
        zoom,
        transitionDuration: 500,
      });
    },
    [viewport],
  );

  const handleFitBoundsChange = useCallback((b) => {
    console.log('BOUNDS', b);
    setBounds(b);
  }, []);

  const handleTransformRequest = (url) => {
    if (url.startsWith(process.env.NEXT_PUBLIC_API_URL)) {
      return {
        url,
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      };
    }

    return null;
  };

  return (
    <AnimatePresence>
      {id && scenariosIsFetched && (
        <motion.div
          key="project-map"
          className="relative w-full h-full col-span-5 overflow-hidden pointer-events-none rounded-4xl"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
        >
          <div className="w-full h-full">
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
              transformRequest={handleTransformRequest}
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
          </div>

          <Controls>
            <ZoomControl
              viewport={{
                ...viewport,
                minZoom,
                maxZoom,
              }}
              onZoomChange={handleZoomChange}
            />

            <FitBoundsControl
              bounds={{
                ...bounds,
                viewportOptions: {
                  transitionDuration: 1500,
                },
              }}
              onFitBoundsChange={handleFitBoundsChange}
            />
          </Controls>

        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PublishedProjectMap;
