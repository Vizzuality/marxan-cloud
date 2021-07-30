import React, { useCallback, useEffect, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { useProject } from 'hooks/projects';
import { useRouter } from 'next/router';

// Map
import Map from 'components/map';

// Controls
import Controls from 'components/map/controls';
import ZoomControl from 'components/map/controls/zoom';
import FitBoundsControl from 'components/map/controls/fit-bounds';

// Guided help
import HelpBeacon from 'layout/help/beacon';

export interface ProjectMapProps {
}

export const ProjectMap: React.FC<ProjectMapProps> = () => {
  const minZoom = 2;
  const maxZoom = 20;
  const [viewport, setViewport] = useState({});
  const [bounds, setBounds] = useState(null);

  const { query } = useRouter();
  const { pid } = query;
  const { data = {} } = useProject(pid);
  const { id, bbox } = data;

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

  return (
    <AnimatePresence>
      {id && (
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
            subtitle="Visualize all features"
            content={(
              <div>
                On this map you will be able to visualize all the
                spatial components of the conservation plan. You will
                be able to visualize your planning region,
                features and results.

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
              >
                {/* {(map) => {
              return (
                <LayerManager map={map} plugin={PluginMapboxGl}>
                  {LAYERS.map((l) => (
                    <Layer key={l.id} {...l} />
                  ))}
                </LayerManager>
              );
            }} */}

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
