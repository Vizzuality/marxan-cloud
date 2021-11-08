import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { setLayerSettings } from 'store/slices/projects/[id]';

import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import { LayerManager, Layer } from '@vizzuality/layer-manager-react';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { useSession } from 'next-auth/client';

import {
  useAdminPreviewLayer, useLegend, usePUCompareLayer, usePUGridLayer,
} from 'hooks/map';
import { useProject } from 'hooks/projects';
import { useScenarios } from 'hooks/scenarios';

import HelpBeacon from 'layout/help/beacon';

import Select from 'components/forms/select';
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

export interface ProjectMapProps {
}

export const ProjectMap: React.FC<ProjectMapProps> = () => {
  const [open, setOpen] = useState(false);
  const [sid1, setSid1] = useState(null);
  const [sid2, setSid2] = useState(null);
  const [session] = useSession();

  const minZoom = 2;
  const maxZoom = 20;
  const [viewport, setViewport] = useState({});
  const [bounds, setBounds] = useState(null);
  const [mapInteractive, setMapInteractive] = useState(false);

  const { query } = useRouter();
  const { pid } = query;
  const { data = {} } = useProject(pid);
  const {
    id, bbox, countryId, adminAreaLevel1Id, adminAreaLevel2Id,
  } = data;

  const {
    data: rawScenariosData,
    isFetched: rawScenariosIsFetched,
  } = useScenarios(pid, {
    filters: {
      projectId: pid,
    },
    sort: '-lastModifiedAt',
  });

  const {
    // Settings
    layerSettings,
  } = useSelector((state) => state['/projects/[id]']);

  const dispatch = useDispatch();

  const sid = useMemo(() => {
    if (sid1) return sid1;

    return rawScenariosIsFetched && rawScenariosData && !!rawScenariosData.length ? `${rawScenariosData[0].id}` : null;
  }, [sid1, rawScenariosData, rawScenariosIsFetched]);

  const PUGridLayer = usePUGridLayer({
    active: rawScenariosIsFetched && rawScenariosData && !!rawScenariosData.length && !sid2,
    sid,
    include: 'results',
    sublayers: [
      ...(sid1 && !sid2) ? ['solutions'] : [],
    ],
    options: {
      settings: {
        pugrid: layerSettings.pugrid,
        'wdpa-percentage': layerSettings['wdpa-percentage'],
        features: layerSettings.features,
        cost: layerSettings.cost,
        'lock-in': layerSettings['lock-in'],
        'lock-out': layerSettings['lock-out'],
        frequency: layerSettings.frequency,
        solution: layerSettings.solution,
      },
    },
  });

  const PUCompareLayer = usePUCompareLayer({
    active: !!sid1 && !!sid2,
    sid1,
    sid2,
    options: {
      ...layerSettings.compare,
    },
  });

  const AdminPreviewLayer = useAdminPreviewLayer({
    active: (
      rawScenariosIsFetched && rawScenariosData && !rawScenariosData.length
      && (countryId || adminAreaLevel1Id || adminAreaLevel2Id)),
    country: countryId,
    region: adminAreaLevel1Id,
    subregion: adminAreaLevel2Id,
  });

  const LAYERS = [PUCompareLayer, PUGridLayer, AdminPreviewLayer].filter((l) => !!l);

  console.log('LAYERS', LAYERS);

  const LEGEND = useLegend({
    layers: [
      ...!!sid1 && !sid2 ? ['frequency'] : [],
      ...!!sid1 && !!sid2 ? ['compare'] : [],
      'pugrid',
    ],
    options: {
      layerSettings,
    },
  });

  const SCENARIOS_RUNNED = useMemo(() => {
    const status = rawScenariosData
      .map((s) => {
        if (s.jobs.find((j) => j.kind === 'run' && j.status === 'done')) {
          return {
            label: s.name,
            value: s.id,
          };
        }

        return null;
      });

    return {
      sid1Options: status.filter((s) => !!s),
      sid2Options: status.filter((s) => !!s && s.value !== sid1),
    };
  }, [rawScenariosData, sid1]);

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
          Authorization: `Bearer ${session.accessToken}`,
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
      {id && rawScenariosIsFetched && (
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
          <div className="absolute w-full max-w-xs bottom-14 right-5">
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
                    {type === 'matrix' && <LegendTypeMatrix className="pt-6 pb-4 text-sm text-white" intersections={intersections} items={items} />}
                    {type === 'basic' && <LegendTypeBasic className="text-sm text-gray-300" items={items} />}
                    {type === 'choropleth' && <LegendTypeChoropleth className="text-sm text-gray-300" items={items} />}
                    {type === 'gradient' && <LegendTypeGradient className={{ box: 'text-sm text-gray-300' }} items={items} />}
                  </LegendItem>
                );
              })}
            </Legend>
          </div>

          {!!SCENARIOS_RUNNED.sid1Options.length && (
            <div className="absolute top-0 left-0 flex w-full p-5 space-x-5">
              <div className="w-full">
                <Select
                  theme="dark"
                  size="base"
                  placeholder="Select scenario..."
                  clearSelectionActive
                  options={SCENARIOS_RUNNED.sid1Options}
                  selected={sid1}
                  onChange={(s) => {
                    setSid1(s);
                    // Remove compare if you unselect a sceanrio or
                    // if it's the same as the compare one
                    if (!s || s === sid2) {
                      setSid2(null);
                    }
                  }}
                />
              </div>

              <div
                className={cx({
                  'w-full': true,
                  'invisible opacity-0': SCENARIOS_RUNNED.sid1Options.length <= 1,
                })}
              >
                <Select
                  theme="dark"
                  size="base"
                  placeholder="Compare to..."
                  clearSelectionActive
                  options={SCENARIOS_RUNNED.sid2Options}
                  selected={sid2}
                  onChange={(s) => {
                    setSid2(s);
                  }}
                />
              </div>
            </div>
          )}
        </motion.div>
      )}

      <Loading
        visible={!mapInteractive}
        className="absolute top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center w-full h-full bg-black bg-opacity-90"
        iconClassName="w-10 h-10 text-primary-500"
      />

    </AnimatePresence>
  );
};

export default ProjectMap;
