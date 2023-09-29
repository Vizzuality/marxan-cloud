import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/router';

import { useAppSelector } from 'store/hooks';

import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import { LayerManager, Layer } from '@vizzuality/layer-manager-react';

import { useAccessToken } from 'hooks/auth';
import { useProjectPlanningAreaLayer, useLegend, useBBOX } from 'hooks/map';
import { useProject } from 'hooks/projects';

import Loading from 'components/loading';
import Map from 'components/map';
import Controls from 'components/map/controls';
import FitBoundsControl from 'components/map/controls/fit-bounds';
import LoadingControl from 'components/map/controls/loading';
import ZoomControl from 'components/map/controls/zoom';
import Legend from 'components/map/legend';
import LegendItem from 'components/map/legend/item';
import LegendTypeBasic from 'components/map/legend/types/basic';
import LegendTypeChoropleth from 'components/map/legend/types/choropleth';
import LegendTypeGradient from 'components/map/legend/types/gradient';
import LegendTypeMatrix from 'components/map/legend/types/matrix';
import ScenariosDrawingManager from 'layout/scenarios/edit/map/drawing-manager';
import { MapProps } from 'types/map';
import { centerMap } from 'utils/map';

export const ScenarioNewMap = (): JSX.Element => {
  const [open, setOpen] = useState(true);
  const [mapInteractive, setMapInteractive] = useState(false);

  const mapRef = useRef<mapboxgl.Map | null>(null);

  const accessToken = useAccessToken();

  const { query } = useRouter();

  const { pid } = query as { pid: string };

  const { data: projectData } = useProject(pid);
  const { bbox } = projectData;

  const BBOX = useBBOX({
    bbox,
  });

  const minZoom = 2;
  const maxZoom = 20;
  const [viewport, setViewport] = useState({});
  const [bounds, setBounds] = useState<MapProps['bounds']>(null);
  const [mapTilesLoaded, setMapTilesLoaded] = useState(false);

  const { isSidebarOpen } = useAppSelector((state) => state['/projects/[id]']);

  const PlanningAreaLayer = useProjectPlanningAreaLayer({
    active: true,
    pId: `${pid}`,
  });

  const LAYERS = [PlanningAreaLayer].filter((l) => !!l);

  const LEGEND = useLegend({
    layers: [],
  });

  useEffect(() => {
    setBounds({
      bbox: BBOX,
      options: { padding: { top: 50, right: 50, bottom: 50, left: 575 } },
      viewportOptions: { transitionDuration: 0 },
    });
  }, [BBOX]);

  useEffect(() => {
    centerMap({ ref: mapRef.current, isSidebarOpen });
  }, [isSidebarOpen]);

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
    [viewport]
  );

  const handleFitBoundsChange = useCallback((b) => {
    setBounds(b);
  }, []);

  const handleClick = useCallback((e) => {
    if (e && e.features) {
      console.info(e.features);
    }
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

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Map
        key={accessToken}
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
        onMapLoad={({ map }) => {
          mapRef.current = map;
          setMapInteractive(true);
        }}
        onMapTilesLoaded={(loaded) => setMapTilesLoaded(loaded)}
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
        <LoadingControl loading={!mapTilesLoaded} />
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
      <div className="absolute bottom-16 right-5 w-full max-w-xs">
        <Legend open={open} className="max-h-[325px] w-full" onChangeOpen={() => setOpen(!open)}>
          {LEGEND.map((i) => {
            const { type, items, intersections } = i;

            return (
              <LegendItem sortable={false} key={i.id} settingsManager={i.settingsManager} {...i}>
                {type === 'matrix' && (
                  <LegendTypeMatrix
                    className="text-sm text-white"
                    intersections={intersections}
                    items={items}
                  />
                )}
                {type === 'basic' && (
                  <LegendTypeBasic className="text-sm text-gray-400" items={items} />
                )}
                {type === 'choropleth' && (
                  <LegendTypeChoropleth className="text-sm text-gray-400" items={items} />
                )}
                {type === 'gradient' && (
                  <LegendTypeGradient className={{ box: 'text-sm text-gray-400' }} items={items} />
                )}
              </LegendItem>
            );
          })}
        </Legend>
      </div>
      <Loading
        visible={!mapInteractive}
        className="absolute bottom-0 left-0 right-0 top-0 z-40 flex h-full w-full items-center justify-center bg-black bg-opacity-90"
        iconClassName="w-10 h-10 text-primary-500"
      />
    </div>
  );
};

export default ScenarioNewMap;
