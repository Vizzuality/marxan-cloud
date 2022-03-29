import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { setLayerSettings } from 'store/slices/projects/[id]';

import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import { LayerManager, Layer } from '@vizzuality/layer-manager-react';
import { AnimatePresence, motion } from 'framer-motion';

import { useAccessToken } from 'hooks/auth';
import { useLegend, usePUGridLayer } from 'hooks/map';
import { useProject } from 'hooks/projects';
import { useScenarios } from 'hooks/scenarios';

import HelpBeacon from 'layout/help/beacon';

import Loading from 'components/loading';
import Map from 'components/map';
import Controls from 'components/map/controls';
import FitBoundsControl from 'components/map/controls/fit-bounds';
import ZoomControl from 'components/map/controls/zoom';
import Legend from 'components/map/legend';
import LegendItem from 'components/map/legend/item';
import LegendTypeBasic from 'components/map/legend/types/basic';
import LegendTypeChoropleth from 'components/map/legend/types/choropleth';
import LegendTypeGradient from 'components/map/legend/types/gradient';
import LegendTypeMatrix from 'components/map/legend/types/matrix';

export interface PublishedProjectMapProps {
}

export const PublishedProjectMap: React.FC<PublishedProjectMapProps> = () => {
  const [open, setOpen] = useState(false);
  const [mapInteractive, setMapInteractive] = useState(false);

  const accessToken = useAccessToken();

  const minZoom = 2;
  const maxZoom = 20;
  const [viewport, setViewport] = useState({});
  const [bounds, setBounds] = useState(null);

  const { query } = useRouter();
  const { pid } = query;
  const { data = {} } = useProject(pid);
  const {
    id, bbox,
  } = data;

  const {
    data: scenariosData,
    isFetched: scenariosAreFetched,
  } = useScenarios(pid, {
    filters: {
      projectId: pid,
    },
    sort: '-lastModifiedAt',
  });

  const {
    layerSettings,
  } = useSelector((state) => state['/projects/[id]']);

  const dispatch = useDispatch();

  const sid = useMemo(() => {
    const first = scenariosData
      .find((s) => {
        return s.jobs.find((j) => j.kind === 'run' && j.status === 'done');
      });

    return first?.id;
  }, [scenariosData]);

  const PUGridLayer = usePUGridLayer({
    active: !!sid,
    sid: `${sid}`,
    include: 'results',
    sublayers: sid ? ['solutions'] : [],
    options: {
      settings: {
        pugrid: layerSettings.pugrid,
        frequency: layerSettings.frequency,
      },
    },
  });

  const LAYERS = [PUGridLayer].filter((l) => !!l);

  const LEGEND = useLegend({
    layers: sid ? ['frequency', 'pugrid'] : ['pugrid'],
    options: {
      layerSettings,
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

  const onChangeOpacity = useCallback((opacity, lid) => {
    dispatch(setLayerSettings({
      id: lid,
      settings: { opacity },
    }));
  }, [dispatch]);

  const onChangeVisibility = useCallback((lid) => {
    const { visibility = true } = layerSettings[lid] || {};
    dispatch(setLayerSettings({
      id: lid,
      settings: { visibility: !visibility },
    }));
  }, [dispatch, layerSettings]);

  return (
    <AnimatePresence>
      {id && scenariosAreFetched && (
        <motion.div
          key="project-map"
          className="relative w-full h-full col-span-5 overflow-hidden rounded-4xl"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
        >
          <HelpBeacon
            id="project-map"
            title="Map view"
            subtitle="Visualize all elements"
            content={(
              <div className="space-y-2">
                <p>
                  On this map you will be able to visualize all the
                  spatial components of the conservation plan.
                </p>
                <p>
                  You will
                  be able to visualize your planning region,
                  your features and, once you have run Marxan,
                  you will also be able to visualize the
                  results here.
                </p>
              </div>
            )}
            modifiers={['flip']}
            tooltipPlacement="left"
          >
            <div className="w-full h-full">
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
                onMapLoad={() => setMapInteractive(true)}
                transformRequest={handleTransformRequest}
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
          </HelpBeacon>

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
          <div className="absolute w-full max-w-xs bottom-10 right-2">
            <Legend
              open={open}
              className="w-full"
              maxHeight={300}
              onChangeOpen={() => setOpen(!open)}
            >
              {LEGEND.map((i) => {
                const { type, items, intersections } = i;

                return (
                  <LegendItem
                    sortable={false}
                    key={i.id}
                    settingsManager={i.settingsManager}
                    onChangeOpacity={(opacity) => onChangeOpacity(opacity, i.id)}
                    onChangeVisibility={() => onChangeVisibility(i.id)}
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
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PublishedProjectMap;
