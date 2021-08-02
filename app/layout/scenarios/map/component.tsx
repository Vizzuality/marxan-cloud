import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';

// Map
import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { useWDPAPreviewLayer, usePUGridLayer } from 'hooks/map';
import { useProject } from 'hooks/projects';

import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import { LayerManager, Layer } from '@vizzuality/layer-manager-react';
import { useSession } from 'next-auth/client';
import { getScenarioSlice } from 'store/slices/scenarios/edit';

import Map from 'components/map';
// import LAYERS from 'components/map/layers';

// Controls
import Controls from 'components/map/controls';
import FitBoundsControl from 'components/map/controls/fit-bounds';
import ZoomControl from 'components/map/controls/zoom';

import ScenariosDrawingManager from './drawing-manager';

export interface ScenariosMapProps {
}

export const ScenariosMap: React.FC<ScenariosMapProps> = () => {
  const [session] = useSession();

  const { query } = useRouter();
  const { pid, sid } = query;

  const { data = {} } = useProject(pid);
  const { bbox } = data;

  const scenarioSlice = getScenarioSlice(sid);
  const { setPuIncludedValue, setPuExcludedValue } = scenarioSlice.actions;
  const dispatch = useDispatch();
  const {
    tab, cache, wdpaCategories, clicking, puAction, puIncludedValue, puExcludedValue,
  } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const minZoom = 2;
  const maxZoom = 20;
  const [viewport, setViewport] = useState({});
  const [bounds, setBounds] = useState(null);

  const WDPApreviewLayer = useWDPAPreviewLayer({
    ...wdpaCategories,
    cache,
    active: tab === 'protected-areas',
    bbox,
  });

  const type = useMemo(() => {
    if (tab === 'analysis') {
      return 'adjust-planning-units';
    }

    return 'default';
  }, [tab]);

  const PUGridLayer = usePUGridLayer({
    cache,
    active: true,
    sid: sid ? `${sid}` : null,
    type,
    options: {
      puAction,
      puIncludedValue,
      puExcludedValue,
    },
  });

  const LAYERS = [WDPApreviewLayer, PUGridLayer].filter((l) => !!l);

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

  const handleClick = useCallback((e) => {
    if (e && e.features) {
      console.info(e.features);
    }

    if (clicking) {
      const { features = [] } = e;

      const pUGridLayer = features.find((f) => f.source === `pu-grid-layer-${cache}`);

      if (pUGridLayer) {
        const { properties } = pUGridLayer;
        const { pugeomid } = properties;

        const newClickingValue = puAction === 'include' ? [...puIncludedValue] : [...puExcludedValue];
        const newAction = puAction === 'include' ? setPuIncludedValue : setPuExcludedValue;

        const index = newClickingValue.findIndex((s) => s === pugeomid);

        if (index > -1) {
          newClickingValue.splice(index, 1);
        } else {
          newClickingValue.push(pugeomid);
        }

        dispatch(newAction(newClickingValue));
      }
    }
  }, [
    clicking,
    puAction,
    puIncludedValue,
    puExcludedValue,
    dispatch,
    setPuIncludedValue,
    setPuExcludedValue,
    cache,
  ]);

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
    <div className="relative w-full h-full overflow-hidden rounded-4xl">
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
        onClick={handleClick}
        transformRequest={handleTransformRequest}
      >
        {(map) => {
          return (
            <>
              <LayerManager map={map} plugin={PluginMapboxGl}>
                {LAYERS.map((l) => (
                  <Layer key={l.id} {...l} />
                ))}
              </LayerManager>

              {/* Drawing editor */}
              <ScenariosDrawingManager />
            </>
          );
        }}
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
    </div>
  );
};

export default ScenariosMap;
