import { ComponentProps, useCallback, useEffect, useMemo, useState, useRef } from 'react';

import { useQueryClient } from 'react-query';

import { useRouter } from 'next/router';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { setLayerSettings } from 'store/slices/projects/[id]';

import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import { LayerManager, Layer } from '@vizzuality/layer-manager-react';
import chroma from 'chroma-js';
import { AnimatePresence, motion } from 'framer-motion';
import pick from 'lodash/pick';
import { FiLayers } from 'react-icons/fi';
import { HiOutlinePrinter } from 'react-icons/hi';

import { useAccessToken } from 'hooks/auth';
import { useProjectCostSurface } from 'hooks/cost-surface';
import { useAllFeatures } from 'hooks/features';
import {
  usePUCompareLayer,
  usePUGridLayer,
  useProjectPlanningAreaLayer,
  useBBOX,
  useFeaturePreviewLayers,
  useWDPAPreviewLayer,
  useCostSurfaceLayer,
  useContinuousFeaturesLayers,
} from 'hooks/map';
import { COLORS } from 'hooks/map/constants';
import { useDownloadScenarioComparisonReport, useProject } from 'hooks/projects';
import { useScenarios } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';
import { useProjectWDPAs } from 'hooks/wdpa';

import Select from 'components/forms/select';
import Loading from 'components/loading';
import Map from 'components/map';
import Controls from 'components/map/controls';
import FitBoundsControl from 'components/map/controls/fit-bounds';
import LoadingControl from 'components/map/controls/loading';
import ZoomControl from 'components/map/controls/zoom';
import Legend from 'components/map/legend';
import LegendGroup from 'components/map/legend/group';
import LegendItem from 'components/map/legend/item';
import { LegendItemType } from 'components/map/legend/types';
import LegendTypeBasic from 'components/map/legend/types/basic';
import LegendTypeChoropleth from 'components/map/legend/types/choropleth';
import LegendTypeGradient from 'components/map/legend/types/gradient';
import LegendTypeMatrix from 'components/map/legend/types/matrix';
import HelpBeacon from 'layout/help/beacon';
import { Scenario } from 'types/api/scenario';
import { MapProps } from 'types/map';
import { cn } from 'utils/cn';
import { centerMap } from 'utils/map';

import { useInventoryLegend } from './legend/hooks';

const minZoom = 2;
const maxZoom = 20;

export const ProjectMap = (): JSX.Element => {
  const [open, setOpen] = useState(true);
  const [sid1, setSid1] = useState<Scenario['id']>(null);
  const [sid2, setSid2] = useState<Scenario['id']>(null);
  const {
    isSidebarOpen,
    layerSettings,
    selectedFeatures: selectedFeaturesIds,
    selectedCostSurface,
    selectedContinuousFeatures,
  } = useAppSelector((state) => state['/projects/[id]']);

  const accessToken = useAccessToken();
  const queryClient = useQueryClient();

  const [viewport, setViewport] = useState({});
  const [bounds, setBounds] = useState<MapProps['bounds']>(null);
  const [mapInteractive, setMapInteractive] = useState(false);
  const [mapTilesLoaded, setMapTilesLoaded] = useState(false);

  const mapRef = useRef<mapboxgl.Map | null>(null);

  const { query } = useRouter();
  const { pid, tab } = query as { pid: string; tab: string };
  const { data } = useProject(pid);

  const { addToast } = useToasts();

  const { id, bbox, name: projectName } = data;

  const BBOX = useBBOX({
    bbox,
  });

  const isComparisonEnabled = Boolean(!tab && sid1 && sid2);

  const legendConfig = useInventoryLegend({
    isComparisonEnabled,
    comparisonSettings: {
      sid1,
      sid2,
    },
  });

  const allFeaturesQuery = useAllFeatures(pid);

  const protectedAreaQuery = useProjectWDPAs(
    pid,
    { sort: 'name' },
    {
      select: (data) => data.map(({ id }) => id),
    }
  );

  const costSurfaceQuery = useProjectCostSurface(pid, selectedCostSurface);

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

  const featuresColorQuery = useAllFeatures(
    pid,
    {
      filters: {
        sort: 'featureClassName',
      },
      disablePagination: true,
    },
    {
      select: ({ data }) => {
        return data.map((feature, index) => {
          const color =
            data.length > COLORS['features-preview'].ramp.length
              ? chroma.scale(COLORS['features-preview'].ramp).colors(data.length)[index]
              : COLORS['features-preview'].ramp[index];

          return {
            id: feature.id,
            color,
          };
        });
      },
      placeholderData: { data: [] },
    }
  );

  const PlanningAreaLayer = useProjectPlanningAreaLayer({
    active: rawScenariosIsFetched && rawScenariosData && !rawScenariosData.length,
    pId: `${pid}`,
  });

  const PUGridLayer = usePUGridLayer({
    active: rawScenariosIsFetched && rawScenariosData && !!rawScenariosData.length && !sid2,
    sid: sid ? `${sid}` : null,
    include: 'results',
    sublayers: [
      ...(sid1 && !sid2 ? ['frequency'] : []),
      ...(!!selectedCostSurface ? ['cost'] : []),
      ...(!!selectedFeaturesIds.length ? ['features'] : []),
    ],
    options: {
      cost: { min: 1, max: 100 },
      settings: {
        pugrid: layerSettings.pugrid,
        'wdpa-percentage': layerSettings['wdpa-percentage'],
        features: layerSettings.features,
        frequency: layerSettings.frequency,
      },
    },
  });

  const costSurfaceLayer = useCostSurfaceLayer({
    active: Boolean(selectedCostSurface) && costSurfaceQuery.isSuccess,
    pid,
    costSurfaceId: selectedCostSurface,
    layerSettings: {
      ...layerSettings[selectedCostSurface],
      min: costSurfaceQuery.data?.min,
      max: costSurfaceQuery.data?.max,
    } as Parameters<typeof useCostSurfaceLayer>[0]['layerSettings'],
  });

  const PUCompareLayer = usePUCompareLayer({
    active: isComparisonEnabled,
    sid: sid1,
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
      layerSettings,
    },
  });

  const WDPAsPreviewLayers = useWDPAPreviewLayer({
    WDPACategories: protectedAreaQuery.data,
    pid: `${pid}`,
    active: true,
    bbox,
    options: {
      layerSettings,
    },
  });

  const continuousFeaturesLayers = useContinuousFeaturesLayers({
    active: selectedContinuousFeatures.length > 0,
    pid,
    features: selectedContinuousFeatures,
    layerSettings,
  });

  const selectedPreviewFeatures = useMemo(() => {
    return selectedFeaturesData
      ?.map(({ featureClassName, id }) => ({ name: featureClassName, id }))
      .sort((a, b) => {
        const aIndex = selectedFeaturesIds.indexOf(a.id);
        const bIndex = selectedFeaturesIds.indexOf(b.id as string);
        return aIndex - bIndex;
      });
  }, [selectedFeaturesIds, selectedFeaturesData]);

  const LAYERS = [
    PUGridLayer,
    costSurfaceLayer,
    PUCompareLayer,
    PlanningAreaLayer,
    WDPAsPreviewLayers,
    ...FeaturePreviewLayers,
    ...continuousFeaturesLayers,
  ].filter((l) => !!l);

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
      options: { padding: { top: 50, right: 50, bottom: 50, left: 575 } },
      viewportOptions: { transitionDuration: 0 },
    });
  }, [BBOX]);

  useEffect(() => {
    centerMap({ ref: mapRef.current, isSidebarOpen });
  }, [isSidebarOpen]);

  useEffect(() => {
    if (featuresColorQuery.isSuccess) {
      queryClient.setQueryData('feature-colors', featuresColorQuery.data);
    }
  }, [featuresColorQuery, queryClient]);

  const handleViewportChange = useCallback(
    (vw) => {
      setViewport(vw);
    },
    [isSidebarOpen]
  );

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
            visibility: true,
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

  const downloadScenarioComparisonReportMutation = useDownloadScenarioComparisonReport({
    projectId: pid,
  });

  const onDownloadReport = useCallback(() => {
    addToast(
      `info-generating-report-${pid}`,
      <>
        <h2 className="font-medium">Info</h2>
        <p className="text-sm">{`Generating "${projectName}" scenario comparison PDF report`}</p>
      </>,
      {
        level: 'info',
      }
    );

    downloadScenarioComparisonReportMutation.mutate(
      { sid1, sid2, projectName },
      {
        onSuccess: () => {
          addToast(
            `success-generating-report-${pid}`,
            <>
              <h2 className="font-medium">Success!</h2>
              <p className="text-sm">{`"${projectName}" scenario comparison PDF report generated`}</p>
            </>,
            {
              level: 'success',
            }
          );
        },
        onError: () => {
          addToast(
            `error-generating-report-${pid}`,
            <>
              <h2 className="font-medium">Error</h2>
              <p className="text-sm">{`"${projectName}" scenario comparison PDF report not generated`}</p>
            </>,
            {
              level: 'error',
            }
          );
        },
      }
    );
  }, [pid, sid1, sid2, projectName, downloadScenarioComparisonReportMutation, addToast]);

  const renderLegendItems = ({
    type,
    intersections,
    items,
  }: {
    type: LegendItemType;
    intersections?: ComponentProps<typeof LegendTypeMatrix>['intersections'];
    items:
      | ComponentProps<typeof LegendTypeBasic>['items']
      | ComponentProps<typeof LegendTypeChoropleth>['items']
      | ComponentProps<typeof LegendTypeGradient>['items']
      | ComponentProps<typeof LegendTypeMatrix>['items'];
  }) => {
    switch (type) {
      case 'basic':
        return <LegendTypeBasic className="text-sm text-gray-300" items={items} />;
      case 'choropleth':
        return <LegendTypeChoropleth className="text-sm text-gray-300" items={items} />;
      case 'gradient':
        return <LegendTypeGradient className={{ box: 'text-sm text-gray-300' }} items={items} />;
      case 'matrix':
        return (
          <LegendTypeMatrix
            className="text-sm text-white"
            intersections={intersections}
            items={items}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {id && (
        <motion.div
          key="project-map"
          className="relative h-full w-full overflow-hidden"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
        >
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
                onMapLoad={({ map }) => {
                  mapRef.current = map;
                  setMapInteractive(true);
                }}
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
          <div className="absolute bottom-16 right-5 flex w-full max-w-xs flex-col items-end space-y-2">
            <div className="flex flex-col space-y-2">
              {/* Print */}
              {isComparisonEnabled && (
                <button
                  className="rounded-full bg-gray-800 p-5 shadow-xl"
                  onClick={onDownloadReport}
                >
                  <HiOutlinePrinter className="h-6 w-6 text-white" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(!open)}
                className={cn({
                  'rounded-full bg-gray-800 p-5 shadow-xl': true,
                  'bg-blue-400': open,
                })}
              >
                <FiLayers
                  className={cn({
                    'h-6 w-6 text-white': true,
                    'text-gray-700': open,
                  })}
                />
              </button>
            </div>
            <Legend
              open={open}
              className="max-h-[50svh] w-full"
              onChangeOpen={() => setOpen(!open)}
            >
              {legendConfig.map((c) => {
                return (
                  <LegendGroup
                    key={c.name}
                    title={c.name}
                    defaultOpen
                    disabled={!c.layers?.length && !c.subgroups?.[0]?.layers?.length}
                  >
                    <div className="divide-y divide-dashed divide-gray-700">
                      {c.layers?.map((layer) => {
                        if (layer) {
                          return (
                            <LegendItem
                              key={layer.id}
                              onChangeOpacity={(opacity) => onChangeOpacity(opacity, layer.id)}
                              settings={layerSettings[layer.id]}
                              {...layer}
                            >
                              {renderLegendItems(layer)}
                            </LegendItem>
                          );
                        }
                      })}
                    </div>
                    {c.subgroups?.map((subgroup) => {
                      return (
                        <LegendGroup key={subgroup.name} title={subgroup.name} className="pl-5">
                          <div className="divide-y divide-dashed divide-gray-700">
                            {subgroup.layers?.map((layer) => {
                              if (layer) {
                                return (
                                  <LegendItem
                                    key={layer.id}
                                    onChangeOpacity={(opacity) =>
                                      onChangeOpacity(opacity, layer.id)
                                    }
                                    settings={layerSettings[layer.id]}
                                    className="pl-[2px]"
                                    {...layer}
                                  >
                                    {renderLegendItems(layer)}
                                  </LegendItem>
                                );
                              }
                            })}
                          </div>
                        </LegendGroup>
                      );
                    })}
                  </LegendGroup>
                );
              })}
            </Legend>
          </div>

          {!!SCENARIOS_RUNNED.sid1Options.length && !tab && (
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
                  disabled={!sid1}
                  onChange={onChangeScenario2}
                />
              </div>
            </div>
          )}
          <Loading
            visible={!mapInteractive}
            className="absolute bottom-0 left-0 top-0 z-10 flex h-full w-full items-center justify-center bg-black/75"
            iconClassName="w-10 h-10 text-primary-500 translate-x-[275px]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProjectMap;
