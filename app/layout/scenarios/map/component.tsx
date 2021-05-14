import React, {
  useCallback, useState,
} from 'react';

// Map
import Map from 'components/map';
// import LAYERS from 'components/map/layers';

// import { LayerManager, Layer } from 'layer-manager/dist/components';
// import { PluginMapboxGl } from 'layer-manager';

// Controls
import Controls from 'components/map/controls';
import ZoomControl from 'components/map/controls/zoom';
import FitBoundsControl from 'components/map/controls/fit-bounds';

import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { getScenarioSlice } from 'store/slices/scenarios/edit';

import ScenariosDrawingManager from './drawing-manager';

export interface ScenariosMapProps {
}

export const ScenariosMap: React.FC<ScenariosMapProps> = () => {
  const { query } = useRouter();
  const { sid } = query;

  const scenarioSlice = getScenarioSlice(sid);
  const { setClickingValue } = scenarioSlice.actions;
  const dispatch = useDispatch();
  const { clicking, clickingValue } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const minZoom = 2;
  const maxZoom = 20;
  const [viewport, setViewport] = useState({});
  const [bounds, setBounds] = useState({});

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
    if (clicking) {
      console.info(e);
      const newClickingValue = [...clickingValue];
      newClickingValue.push(`pu_id-${Math.random() * 1000}`);

      dispatch(setClickingValue(newClickingValue));
    }
  }, [clicking, clickingValue, dispatch, setClickingValue]);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-4xl">
      <Map
        // bounds={bounds}
        width="100%"
        height="100%"
        minZoom={minZoom}
        maxZoom={maxZoom}
        viewport={viewport}
        mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN}
        mapStyle="mapbox://styles/marxan/ckn4fr7d71qg817kgd9vuom4s"
        onMapViewportChange={handleViewportChange}
        onClick={handleClick}
      >
        {() => {
          return (
            <>
              {/* <LayerManager map={map} plugin={PluginMapboxGl}>
                {LAYERS.map((l) => (
                  <Layer key={l.id} {...l} />
                ))}
              </LayerManager> */}

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
