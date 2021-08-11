import React, { useCallback, useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import { LayerManager, Layer } from '@vizzuality/layer-manager-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSession } from 'next-auth/client';

import { useAdminPreviewLayer, usePUGridLayer } from 'hooks/map';
import { useProject } from 'hooks/projects';
import { useScenarios } from 'hooks/scenarios';

import HelpBeacon from 'layout/help/beacon';

// Map
import Map from 'components/map';
// Controls
import Controls from 'components/map/controls';
import FitBoundsControl from 'components/map/controls/fit-bounds';
import ZoomControl from 'components/map/controls/zoom';

export interface ProjectMapProps {
}

export const ProjectMap: React.FC<ProjectMapProps> = () => {
  const [session] = useSession();

  const minZoom = 2;
  const maxZoom = 20;
  const [viewport, setViewport] = useState({});
  const [bounds, setBounds] = useState(null);

  const { query } = useRouter();
  const { pid } = query;
  const { data = {} } = useProject(pid);
  const {
    id, bbox, countryId, adminAreaLevel1Id, adminAreaLevel2Id,
  } = data;

  const {
    data: rawScenariosData,
    isFetched: rawScenariosIsFetched,
  } = useScenarios(pid, {
    filters: {
      projectId: pid,
    },
  });

  const PUGridLayer = usePUGridLayer({
    active: rawScenariosIsFetched && rawScenariosData && !!rawScenariosData.length,
    sid: rawScenariosIsFetched && rawScenariosData && !!rawScenariosData.length ? `${rawScenariosData[0].id}` : null,
    type: null,
    subtype: null,
    options: {
    },
  });

  const AdminPreviewLayer = useAdminPreviewLayer({
    active: (
      rawScenariosIsFetched && rawScenariosData && !rawScenariosData.length
      && (countryId || adminAreaLevel1Id || adminAreaLevel2Id)),
    country: countryId,
    region: adminAreaLevel1Id,
    subregion: adminAreaLevel2Id,
  });

  const LAYERS = [PUGridLayer, AdminPreviewLayer].filter((l) => !!l);

  useEffect(() => {
    setBounds({
      bbox,
      options: { padding: 50 },
      viewportOptions: { transitionDuration: 0 },
    });
  }, [bbox]);

  const handleViewportChange = useCallback((vw) => {
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
      {id && rawScenariosIsFetched && (
        <motion.div
          key="project-map"
          className="relative w-full h-full col-span-5 overflow-hidden rounded-4xl"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
        >
          <HelpBeacon
            id="project-map"
            title="Map view"
            subtitle="Visualize all elements"
            content={(
              <div className="space-y-2">
                <p>
                  On this map you will be able to visualize all the
                  spatial components of the conservation plan.
                </p>
                <p>
                  You will
                  be able to visualize your planning region,
                  your features and, once you have run Marxan,
                  you will also be able to visualize here the
                  results.
                </p>
              </div>
            )}
            modifiers={['flip']}
            tooltipPlacement="left"
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
          </HelpBeacon>

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

export default ProjectMap;
