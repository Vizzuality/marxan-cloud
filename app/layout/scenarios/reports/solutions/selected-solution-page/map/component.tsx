import React, { useCallback, useEffect, useState } from 'react';

import { useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { setMaps } from 'store/slices/reports/solutions';

import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import { LayerManager, Layer } from '@vizzuality/layer-manager-react';

import { useAccessToken } from 'hooks/auth';
import { useBBOX, usePUGridLayer } from 'hooks/map';
import { useProject } from 'hooks/projects';
import { useScenario } from 'hooks/scenarios';
import { useBestSolution, useSolution } from 'hooks/solutions';

import Map from 'components/map';

export interface ScenariosReportMapProps {
  id: string;
}

export const ScenariosReportMap: React.FC<ScenariosReportMapProps> = ({
  id,
}: ScenariosReportMapProps) => {
  const accessToken = useAccessToken();
  const [cache] = useState<number>(Date.now());
  const [mapTilesLoaded, setMapTilesLoaded] = useState(false);

  const { query } = useRouter();

  const { pid, sid, solutionId } = query as { pid: string; sid: string; solutionId: string };

  const dispatch = useDispatch();

  const { data = {} } = useProject(pid);
  const { bbox } = data;
  const BBOX = useBBOX({
    bbox,
  });

  const { data: scenarioData } = useScenario(sid);

  const { data: selectedSolutionData } = useSolution(sid, solutionId);

  const { data: bestSolutionData } = useBestSolution(sid, {
    enabled: scenarioData?.ranAtLeastOnce,
  });
  const SOLUTION_DATA = selectedSolutionData || bestSolutionData;

  const minZoom = 2;
  const maxZoom = 20;
  const [viewport, setViewport] = useState({});
  const [bounds, setBounds] = useState(null);

  const PUGridLayer = usePUGridLayer({
    cache,
    active: true,
    sid: sid ? `${sid}` : null,
    include: 'results',
    sublayers: ['solution'],
    options: {
      runId: SOLUTION_DATA?.runId,
    },
  });

  useEffect(() => {
    setBounds({
      bbox: BBOX,
      options: { padding: 50 },
      viewportOptions: { transitionDuration: 0 },
    });
  }, [BBOX]);

  const handleViewportChange = useCallback((vw) => {
    setViewport(vw);
  }, []);

  const handleTransformRequest = useCallback(
    (url) => {
      if (url.startsWith(process.env.NEXT_PUBLIC_API_URL)) {
        return {
          url,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        };
      }

      return null;
    },
    [accessToken]
  );

  // const handleMapLoad = () => {
  //   dispatch(setMaps({ [id]: true }));
  // };

  useEffect(() => {
    if (mapTilesLoaded) {
      dispatch(setMaps({ [id]: true }));
    }
  }, [id, dispatch, mapTilesLoaded]);

  return (
    <>
      <div className="relative h-full w-2/3 overflow-hidden" style={{ height: '146.05mm' }}>
        <Map
          key={accessToken}
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
          onMapTilesLoaded={(loaded) => setMapTilesLoaded(loaded)}
          transformRequest={handleTransformRequest}
          preserveDrawingBuffer
          preventStyleDiffing
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
