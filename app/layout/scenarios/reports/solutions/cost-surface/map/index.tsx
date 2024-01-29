import { useCallback, useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import { useAppDispatch } from 'store/hooks';
import { setMaps } from 'store/slices/reports/solutions';

import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import { LayerManager, Layer } from '@vizzuality/layer-manager-react';

import { useAccessToken } from 'hooks/auth';
import { useProjectCostSurfaces } from 'hooks/cost-surface';
import { useBBOX, useCostSurfaceLayer } from 'hooks/map';
import { useProject } from 'hooks/projects';

import Map from 'components/map';
import MapScale from 'components/map/scale';

const minZoom = 2;
const maxZoom = 20;

export const CostSurfaceReportMap = ({ id }: { id: string }): JSX.Element => {
  const accessToken = useAccessToken();
  const [mapTilesLoaded, setMapTilesLoaded] = useState(false);

  const { query } = useRouter();

  const { pid, sid } = query as { pid: string; sid: string };

  const dispatch = useAppDispatch();

  const { data } = useProject(pid);

  const costSurfaceQuery = useProjectCostSurfaces(
    pid,
    {},
    {
      select: (data) =>
        data.filter((cs) => cs.scenarios.filter((s) => s.id === sid).length > 0)?.[0],
    }
  );

  const BBOX = useBBOX({
    bbox: data?.bbox,
  });

  const [viewport, setViewport] = useState({});
  const [bounds, setBounds] = useState(null);

  const PUGridLayer = useCostSurfaceLayer({
    active: Boolean(costSurfaceQuery?.data),
    pid,
    costSurfaceId: costSurfaceQuery?.data?.id,
    layerSettings: {
      opacity: 1,
      visibility: true,
      min: costSurfaceQuery?.data?.min,
      max: costSurfaceQuery?.data?.max,
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

  useEffect(() => {
    if (mapTilesLoaded) {
      dispatch(setMaps({ [id]: true }));
    }
  }, [id, dispatch, mapTilesLoaded]);

  return (
    <>
      <div className="relative h-full w-4/6 overflow-hidden" style={{ height: '85mm' }}>
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
              <>
                <LayerManager map={map} plugin={PluginMapboxGl}>
                  <Layer key={PUGridLayer.id} {...PUGridLayer} />
                </LayerManager>
                <MapScale className="right-3" />
              </>
            );
          }}
        </Map>
      </div>
    </>
  );
};

export default CostSurfaceReportMap;
