import React, { useCallback, useEffect, useState } from 'react';

import { useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { setMaps } from 'store/slices/reports/frequency';

import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import { LayerManager, Layer } from '@vizzuality/layer-manager-react';

import { useAccessToken } from 'hooks/auth';
import {
  usePUGridLayer,
} from 'hooks/map';
import { useProject } from 'hooks/projects';

import Map from 'components/map';

export interface ScreenshotBLMMapProps {
  id: string;
}

export const ScreenshotBLMMap: React.FC<ScreenshotBLMMapProps> = ({
  id,
}: ScreenshotBLMMapProps) => {
  const accessToken = useAccessToken();

  const { query } = useRouter();

  const { pid, sid } = query;

  const dispatch = useDispatch();

  const {
    data = {},
  } = useProject(pid);
  const { bbox } = data;

  const minZoom = 2;
  const maxZoom = 20;
  const [viewport, setViewport] = useState({});
  const [bounds, setBounds] = useState(null);

  const PUGridLayer = usePUGridLayer({
    cache: Date.now(),
    active: true,
    sid: sid ? `${sid}` : null,
    include: 'results',
    sublayers: ['frequency'],
    options: {
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

  const handleMapLoad = () => {
    dispatch(setMaps({ [id]: true }));
  };

  return (
    <>
      <div
        className="relative w-full h-full overflow-hidden"
      >
        <Map
          className="map-report"
          scrollZoom={false}
          touchZoom={false}
          dragPan={false}
          dragRotate={false}
          touchRotate={false}
          bounds={bounds}
          width={500}
          height={500}
          minZoom={minZoom}
          maxZoom={maxZoom}
          viewport={viewport}
          mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN}
          mapStyle="mapbox://styles/marxan/ckn4fr7d71qg817kgd9vuom4s"
          onMapViewportChange={handleViewportChange}
          onMapLoad={handleMapLoad}
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

export default ScreenshotBLMMap;
