import { useCallback, useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import { useAppDispatch } from 'store/hooks';
import { setMaps } from 'store/slices/reports/solutions';

import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import { LayerManager, Layer } from '@vizzuality/layer-manager-react';

import { useAccessToken } from 'hooks/auth';
import { useBBOX, usePUGridLayer } from 'hooks/map';
import { useProject } from 'hooks/projects';

import Map from 'components/map';

export const ReportMap = ({ id }: { id: string }): JSX.Element => {
  const accessToken = useAccessToken();
  const [cache] = useState<number>(Date.now());
  const [mapTilesLoaded, setMapTilesLoaded] = useState(false);

  const { query } = useRouter();

  const { pid, sid } = query as { pid: string; sid: string };

  const dispatch = useAppDispatch();

  const { data = {} } = useProject(pid);
  const { bbox } = data;
  const BBOX = useBBOX({
    bbox,
  });

  const minZoom = 2;
  const maxZoom = 20;
  const [viewport, setViewport] = useState({});
  const [bounds, setBounds] = useState(null);

  const PUGridLayer = usePUGridLayer({
    cache,
    active: true,
    sid: sid ? `${sid}` : null,
    include: 'cost',
    sublayers: ['cost'],
    options: {
      cost: {
        min: 0,
        max: 1,
      },
      settings: {},
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
      <div className="relative h-full w-4/6 overflow-hidden" style={{ height: '100mm' }}>
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

export default ReportMap;
