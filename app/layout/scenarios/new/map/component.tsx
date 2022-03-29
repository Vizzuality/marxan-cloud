import React, {
  useCallback, useEffect, useState,
} from 'react';

import { useRouter } from 'next/router';

import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import { LayerManager, Layer } from '@vizzuality/layer-manager-react';

import { useAccessToken } from 'hooks/auth';
import {
  useProyectPlanningAreaLayer,
  useLegend,
} from 'hooks/map';
import { useProject } from 'hooks/projects';

import ScenariosDrawingManager from 'layout/scenarios/edit/map/drawing-manager';

import Loading from 'components/loading';
import Map from 'components/map';
// Controls
import Controls from 'components/map/controls';
import FitBoundsControl from 'components/map/controls/fit-bounds';
import ZoomControl from 'components/map/controls/zoom';
import Legend from 'components/map/legend';
import LegendItem from 'components/map/legend/item';
import LegendTypeBasic from 'components/map/legend/types/basic';
import LegendTypeChoropleth from 'components/map/legend/types/choropleth';
import LegendTypeGradient from 'components/map/legend/types/gradient';
import LegendTypeMatrix from 'components/map/legend/types/matrix';

export interface ScenarioNewMapProps {
}

export const ScenarioNewMap: React.FC<ScenarioNewMapProps> = () => {
  const [open, setOpen] = useState(true);
  const [mapInteractive, setMapInteractive] = useState(false);

  const accessToken = useAccessToken();

  const { query } = useRouter();

  const { pid } = query;

  const {
    data: projectData,
  } = useProject(pid);
  const { bbox } = projectData;

  const minZoom = 2;
  const maxZoom = 20;
  const [viewport, setViewport] = useState({});
  const [bounds, setBounds] = useState(null);

  const PlanningAreaLayer = useProyectPlanningAreaLayer({
    active: true,
    pId: `${pid}`,
  });

  const LAYERS = [
    PlanningAreaLayer,
  ].filter((l) => !!l);

  const LEGEND = useLegend({
    layers: [],
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
  }, [
  ]);

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
        onClick={handleClick}
        onMapViewportChange={handleViewportChange}
        onMapLoad={() => setMapInteractive(true)}
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

      {/* Controls */}
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

      {/* Legend */}
      <div className="absolute w-full max-w-xs bottom-14 right-5">
        <Legend
          open={open}
          className="w-full"
          maxHeight={325}
          onChangeOpen={() => setOpen(!open)}
        >
          {LEGEND.map((i) => {
            const {
              type, items, intersections,
            } = i;

            return (
              <LegendItem
                sortable={false}
                key={i.id}
                settingsManager={i.settingsManager}
                // onChangeOpacity={(opacity) => onChangeOpacity(opacity, id)}
                // onChangeVisibility={() => onChangeVisibility(id)}
                {...i}
              >
                {type === 'matrix' && <LegendTypeMatrix className="text-sm text-white" intersections={intersections} items={items} />}
                {type === 'basic' && <LegendTypeBasic className="text-sm text-gray-300" items={items} />}
                {type === 'choropleth' && <LegendTypeChoropleth className="text-sm text-gray-300" items={items} />}
                {type === 'gradient' && <LegendTypeGradient className={{ box: 'text-sm text-gray-300' }} items={items} />}
              </LegendItem>
            );
          })}
        </Legend>
      </div>
      <Loading
        visible={!mapInteractive}
        className="absolute top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center w-full h-full bg-black bg-opacity-90"
        iconClassName="w-10 h-10 text-primary-500"
      />
    </div>
  );
};

export default ScenarioNewMap;
