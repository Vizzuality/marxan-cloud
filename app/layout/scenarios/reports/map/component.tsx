import React, { useCallback, useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import { LayerManager, Layer } from '@vizzuality/layer-manager-react';

import { useAccessToken } from 'hooks/auth';
import {
  usePUGridLayer,
} from 'hooks/map';
import { useProject } from 'hooks/projects';
import { useScenario } from 'hooks/scenarios';
import { useBestSolution } from 'hooks/solutions';

import Loading from 'components/loading';
import Map from 'components/map';

export interface ScenariosReportMapProps {
}

export const ScenariosReportMap: React.FC<ScenariosReportMapProps> = () => {
  const [mapInteractive, setMapInteractive] = useState(false);

  const accessToken = useAccessToken();

  const { query } = useRouter();

  const { pid, sid } = query;

  const {
    data = {},
  } = useProject(pid);
  const { bbox } = data;

  const {
    data: scenarioData,
  } = useScenario(sid);

  const {
    data: bestSolutionData,
  } = useBestSolution(sid, {
    enabled: scenarioData?.ranAtLeastOnce,
  });
  const bestSolution = bestSolutionData;

  const minZoom = 2;
  const maxZoom = 20;
  const [viewport, setViewport] = useState({});
  const [bounds, setBounds] = useState(null);

  const PUGridLayer = usePUGridLayer({
    cache: Date.now(),
    active: true,
    sid: sid ? `${sid}` : null,
    include: 'results',
    sublayers: ['solutions'],
    options: {
      runId: bestSolution?.runId,
    },
  });

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

  const handleTransformRequest = (url) => {
    if (url.startsWith(process.env.NEXT_PUBLIC_API_URL)) {
      return {
        url,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
    }
    return null;
  };

  return (
    <>
      <div className="relative w-full h-full overflow-hidden">
        <Map
          className="map-report"
          scrollZoom={false}
          touchZoom={false}
          dragPan={false}
          dragRotate={false}
          touchRotate={false}
          bounds={bounds}
          width="100%"
          height="100%"
          minZoom={minZoom}
          maxZoom={maxZoom}
          viewport={viewport}
          mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN}
          mapStyle="mapbox://styles/marxan/ckn4fr7d71qg817kgd9vuom4s"
          onMapViewportChange={handleViewportChange}
          onMapLoad={() => setMapInteractive(true)}
          transformRequest={handleTransformRequest}
        >
          {(map) => {
            return (
              <LayerManager map={map} plugin={PluginMapboxGl}>
                <Layer key={PUGridLayer.id} {...PUGridLayer} />
              </LayerManager>
            );
          }}
        </Map>
      </div>
      <Loading
        visible={!mapInteractive}
        className="absolute top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center w-full h-full bg-black bg-opacity-90"
        iconClassName="w-10 h-10 text-primary-500"
      />
    </>
  );
};

export default ScenariosReportMap;
