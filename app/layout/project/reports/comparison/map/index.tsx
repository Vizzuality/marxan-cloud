import React, { useCallback, useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { setMaps } from 'store/slices/reports/comparison';

import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import { LayerManager, Layer } from '@vizzuality/layer-manager-react';

import { useAccessToken } from 'hooks/auth';
import { useBBOX, usePUCompareLayer, usePUGridLayer } from 'hooks/map';
import { useProject } from 'hooks/projects';
import { useScenarios } from 'hooks/scenarios';

import Map from 'components/map';

export const ScreenshotComparisionMap = ({ id }: { id: string }): JSX.Element => {
  const [cache] = useState<number>(Date.now());
  const [mapTilesLoaded, setMapTilesLoaded] = useState(false);

  const accessToken = useAccessToken();

  const { query } = useRouter();

  const { pid, sid, sid2 } = query as {
    pid: string;
    sid: string;
    sid2: string;
  };

  const dispatch = useAppDispatch();

  const { layerSettings } = useAppSelector((state) => state['/projects/[id]']);

  const { data = {} } = useProject(pid);
  const { bbox } = data;
  const BBOX = useBBOX({
    bbox,
  });

  const minZoom = 2;
  const maxZoom = 20;
  const [viewport, setViewport] = useState({});
  const [bounds, setBounds] = useState(null);

  const { data: rawScenariosData, isFetched: rawScenariosIsFetched } = useScenarios(pid, {
    filters: {
      projectId: pid,
    },
    sort: '-lastModifiedAt',
  });

  const PUGridLayer = usePUGridLayer({
    cache,
    active: rawScenariosIsFetched && rawScenariosData && !!rawScenariosData.length && !sid2,
    sid: sid ? `${sid}` : null,
    include: 'results',
    sublayers: [...(sid && !sid2 ? ['frequency'] : [])],
    options: {
      settings: {
        pugrid: layerSettings.pugrid,
        'wdpa-percentage': layerSettings['wdpa-percentage'],
        features: layerSettings.features,
        cost: layerSettings.cost,
        'lock-in': layerSettings['lock-in'],
        'lock-out': layerSettings['lock-out'],
        'lock-available': layerSettings['lock-available'],
        frequency: layerSettings.frequency,
        solution: layerSettings.solution,
      },
    },
  });

  const PUCompareLayer = usePUCompareLayer({
    cache,
    active: !!sid && !!sid2,
    sid,
    sid2,
    options: {
      ...layerSettings.compare,
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

  const LAYERS = [PUGridLayer, PUCompareLayer].filter((l) => !!l);

  return (
    <>
      <div className="relative h-full w-full overflow-hidden" style={{ height: '200mm' }}>
        <Map
          key={accessToken}
          className="map-report"
          scrollZoom={false}
          touchZoom={false}
          dragPan={false}
          dragRotate={false}
          touchRotate={false}
          bounds={bounds}
          width={'100%'}
          height={800}
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
                {LAYERS.map((l) => (
                  <Layer key={l.id} {...l} />
                ))}
              </LayerManager>
            );
          }}
        </Map>
      </div>
    </>
  );
};

export default ScreenshotComparisionMap;
