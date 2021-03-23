import React, { useCallback, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { useProject } from 'hooks/projects';
import { useRouter } from 'next/router';

// Map
import Map from 'components/map';

// Controls
import Controls from 'components/map/controls';
import ZoomControl from 'components/map/controls/zoom';
import FitBoundsControl from 'components/map/controls/fit-bounds';

export interface ProjectMapProps {
}

export const ProjectMap: React.FC<ProjectMapProps> = () => {
  const minZoom = 2;
  const maxZoom = 20;
  const [viewport, setViewport] = useState({});
  const [bounds, setBounds] = useState({});

  const { query } = useRouter();
  const { pid } = query;
  const { data = {} } = useProject(pid);
  const { id } = data;

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
          className="relative w-full h-full overflow-hidden rounded-4xl"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
        >
          <Map
            // bounds={{
            //   bbox: [-1, 40, 1, 42],
            // }}
            width="100%"
            height="100%"
            minZoom={minZoom}
            maxZoom={maxZoom}
            viewport={viewport}
            mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN}
            mapStyle="mapbox://styles/mapbox/dark-v9"
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
