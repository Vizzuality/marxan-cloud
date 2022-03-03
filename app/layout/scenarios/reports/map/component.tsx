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

import Map from 'components/map';

export interface ScenariosReportMapProps {
  id: string;
}

export const ScenariosReportMap: React.FC<ScenariosReportMapProps> = ({
  id,
}: ScenariosReportMapProps) => {
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

  useEffect(() => {
    globalThis.MARXAN = {
      ...globalThis.MARXAN,
      maps: {
        ...globalThis.MARXAN.maps,
        [id]: false,
      },
    };
  }, []); // eslint-disable-line

  const handleMapLoad = () => {
    globalThis.MARXAN = {
      ...globalThis.MARXAN,
      maps: {
        ...globalThis.MARXAN.maps,
        [id]: true,
      },
    };
  };

  return (
    <>
      <div
        className="relative w-2/3 h-full overflow-hidden"
        style={{ height: '146.05mm' }}
      >
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
          onMapLoad={handleMapLoad}
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
    </>
  );
};

export default ScenariosReportMap;
