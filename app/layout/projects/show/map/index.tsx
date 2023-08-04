import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useRouter } from 'next/router';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { setLayerSettings } from 'store/slices/projects/[id]';

import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import { LayerManager, Layer } from '@vizzuality/layer-manager-react';
import { AnimatePresence, motion } from 'framer-motion';
import pick from 'lodash/pick';

import { useAccessToken } from 'hooks/auth';
import { useAllFeatures } from 'hooks/features';
import {
  useLegend,
  usePUCompareLayer,
  usePUGridLayer,
  useProjectPlanningAreaLayer,
  useBBOX,
  useFeaturePreviewLayers,
} from 'hooks/map';
import { useProject } from 'hooks/projects';
import { useScenarios } from 'hooks/scenarios';

import Select from 'components/forms/select';
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
import HelpBeacon from 'layout/help/beacon';
import { cn } from 'utils/cn';

export const ProjectMap = (): JSX.Element => {
  const [open, setOpen] = useState(false);
  const [sid1, setSid1] = useState(null);
  const [sid2, setSid2] = useState(null);
  const {
    isSidebarOpen,
    layerSettings,
    selectedFeatures: selectedFeaturesIds,
  } = useAppSelector((state) => state['/projects/[id]']);

  const accessToken = useAccessToken();

  const minZoom = 2;
  const maxZoom = 20;
  const [viewport, setViewport] = useState({});
  const [bounds, setBounds] = useState(null);
  const [mapInteractive, setMapInteractive] = useState(false);
  const [mapTilesLoaded, setMapTilesLoaded] = useState(false);

  const { query } = useRouter();
  // !TODO: Type tab correctly
  const { pid, tab } = query as { pid: string; tab: string };
  const { data = {} } = useProject(pid);

  const {
    id,
    bbox,
    // countryId,
    // adminAreaLevel1Id,
    // adminAreaLevel2Id,
    // planningUnitGridShape,
    // planningUnitAreakm2,
  } = data;

  const BBOX = useBBOX({
    bbox,
  });

  const allFeaturesQuery = useAllFeatures(pid);

  const selectedFeaturesData = useMemo(() => {
    return allFeaturesQuery.data?.data.filter((f) => selectedFeaturesIds?.includes(f.id));
  }, [selectedFeaturesIds, allFeaturesQuery.data?.data]);

  const { data: rawScenariosData, isFetched: rawScenariosIsFetched } = useScenarios(pid, {
    filters: {
      projectId: pid,
    },
    sort: '-lastModifiedAt',
  });

  const dispatch = useAppDispatch();

  const sid = useMemo(() => {
    if (sid1) return sid1;

    return rawScenariosIsFetched && rawScenariosData && !!rawScenariosData.length
      ? `${rawScenariosData[0].id}`
      : null;
  }, [sid1, rawScenariosData, rawScenariosIsFetched]);

  const PlanningAreaLayer = useProjectPlanningAreaLayer({
    active: rawScenariosIsFetched && rawScenariosData && !rawScenariosData.length,
    pId: `${pid}`,
  });

  const PUGridLayer = usePUGridLayer({
    active: rawScenariosIsFetched && rawScenariosData && !!rawScenariosData.length && !sid2,
    sid: sid ? `${sid}` : null,
    include: 'results',
    sublayers: [...(sid1 && !sid2 ? ['frequency'] : [])],
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
    active: !!sid1 && !!sid2,
    sid1,
    sid2,
    options: {
      ...layerSettings.compare,
    },
  });

  const FeaturePreviewLayers = useFeaturePreviewLayers({
    features: selectedFeaturesData,
    active: selectedFeaturesIds.length > 0,
    bbox,
    options: {
      selectedFeatures: selectedFeaturesIds,
      ...layerSettings['features-preview'],
    },
  });

  const selectedPreviewFeatures = useMemo(() => {
    return selectedFeaturesData
      ?.map(({ featureClassName, id }) => ({ featureClassName, id }))
      .sort((a, b) => {
        const aIndex = selectedFeaturesIds.indexOf(a.id);
        const bIndex = selectedFeaturesIds.indexOf(b.id as string);
        return aIndex - bIndex;
      });
  }, [selectedFeaturesIds, selectedFeaturesData]);

  const LAYERS = [PUGridLayer, PUCompareLayer, PlanningAreaLayer, ...FeaturePreviewLayers].filter(
    (l) => !!l
  );

  const LEGEND = useLegend({
    layers: [
      ...(!!selectedFeaturesData?.length ? ['features-preview'] : []),
      ...(!!sid1 && !sid2 ? ['frequency'] : []),

      ...(!!sid1 && !!sid2 ? ['compare'] : []),
      ...(rawScenariosIsFetched && rawScenariosData && !!rawScenariosData.length && !sid2
        ? ['pugrid']
        : []),
    ],
    options: {
      layerSettings,
      items: selectedPreviewFeatures,
    },
  });

  const SCENARIOS_RUNNED = useMemo(() => {
    const status = rawScenariosData
      .filter((s) => {
        return s.ranAtLeastOnce;
      })
      .map((s) => {
        return {
          label: s.name,
          value: s.id,
        };
      });

    return {
      sid1Options: status.filter((s) => !!s),
      sid2Options: status.filter((s) => !!s && s.value !== sid1),
    };
  }, [rawScenariosData, sid1]);

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

  const onChangeScenario1 = useCallback(
    (s) => {
      setSid1(s);

      dispatch(
        setLayerSettings({
          id: 'compare',
          settings: {
            scenario1: pick(
              rawScenariosData.find((sc) => sc.id === s),
              ['id', 'name']
            ),
          },
        })
      );

      // Remove compare if you unselect a sceanrio or
      // if it's the same as the compare one
      if (!s || s === sid2) {
        setSid2(null);

        dispatch(
          setLayerSettings({
            id: 'compare',
            settings: {
              scenario2: null,
            },
          })
        );
      }
    },
    [dispatch, rawScenariosData, sid2]
  );

  const onChangeScenario2 = useCallback(
    (s) => {
      setSid2(s);

      dispatch(
        setLayerSettings({
          id: 'compare',
          settings: {
            scenario2: pick(
              rawScenariosData.find((sc) => sc.id === s),
              ['id', 'name']
            ),
          },
        })
      );
    },
    [rawScenariosData, dispatch]
  );

  const onChangeOpacity = useCallback(
    (opacity, lid) => {
      dispatch(
        setLayerSettings({
          id: lid,
          settings: { opacity },
        })
      );
    },
    [dispatch]
  );

  const onChangeVisibility = useCallback(
    (lid) => {
      const { visibility = true } = layerSettings[lid] || {};
      dispatch(
        setLayerSettings({
          id: lid,
          settings: { visibility: !visibility },
        })
      );
    },
    [dispatch, layerSettings]
  );

  return (
    <AnimatePresence>
      {id && (
        <motion.div
          key="project-map"
          className="relative col-span-5 h-full w-full overflow-hidden"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
        >
          <Loading
            visible={!mapInteractive}
            className="absolute bottom-0 left-0 right-0 top-0 z-40 flex h-full w-full items-center justify-center bg-black bg-opacity-90"
            iconClassName="w-10 h-10 text-primary-500"
          />

          <HelpBeacon
            id="project-map"
            title="Map view"
            subtitle="Visualize all elements"
            content={
              <div className="space-y-2">
                <p>
                  On this map you will be able to visualize all the spatial components of the
                  conservation plan.
                </p>
                <p>
                  You will be able to visualize your planning region, your features and, once you
                  have run Marxan, you will also be able to visualize the results here.
                </p>
              </div>
            }
            modifiers={['flip']}
            tooltipPlacement="left"
          >
            <div className="h-full w-full">
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
                onMapViewportChange={handleViewportChange}
                onMapLoad={() => setMapInteractive(true)}
                onMapTilesLoaded={(loaded) => setMapTilesLoaded(loaded)}
                transformRequest={handleTransformRequest}
                onClick={(e) => {
                  if (e && e.features) {
                    console.info(e.features);
                  }
                }}
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
            <LoadingControl loading={!mapTilesLoaded} />
          </Controls>

          {/* Legend */}
          <div className="absolute bottom-16 right-5 w-full max-w-xs">
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
                    {type === 'matrix' && (
                      <LegendTypeMatrix
                        className="text-sm text-white"
                        intersections={intersections}
                        items={items}
                      />
                    )}
                    {type === 'basic' && (
                      <LegendTypeBasic className="text-sm text-gray-300" items={items} />
                    )}
                    {type === 'choropleth' && (
                      <LegendTypeChoropleth className="text-sm text-gray-300" items={items} />
                    )}
                    {type === 'gradient' && (
                      <LegendTypeGradient
                        className={{ box: 'text-sm text-gray-300' }}
                        items={items}
                      />
                    )}
                  </LegendItem>
                );
              })}
            </Legend>
          </div>

          {!!SCENARIOS_RUNNED.sid1Options.length && (
            <div
              className={cn({
                'absolute right-24 top-5 flex space-x-5': true,
                'left-16': !isSidebarOpen,
              })}
            >
              <div>
                <Select
                  theme="dark"
                  size="base"
                  placeholder="Select scenario..."
                  clearSelectionActive
                  options={SCENARIOS_RUNNED.sid1Options}
                  selected={sid1}
                  onChange={onChangeScenario1}
                />
              </div>

              <div
                className={cn({
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
                  onChange={onChangeScenario2}
                />
              </div>
            </div>
          )}
          <Loading
            visible={!mapInteractive}
            className="absolute bottom-0 left-0 right-0 top-0 z-40 flex h-full w-full items-center justify-center bg-black bg-opacity-90"
            iconClassName="w-10 h-10 text-primary-500"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProjectMap;
