import React, { ComponentProps, useCallback, useEffect, useState, useMemo, useRef } from 'react';

import { useRouter } from 'next/router';

import { useAppSelector, useAppDispatch } from 'store/hooks';
import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import { LayerManager, Layer } from '@vizzuality/layer-manager-react';
import chroma from 'chroma-js';
import { FiLayers } from 'react-icons/fi';

import { useAccessToken } from 'hooks/auth';
import { useProjectCostSurface } from 'hooks/cost-surface';
import {
  useAllFeatures,
  useColorFeatures,
  useSelectedFeatures,
  useTargetedFeatures,
} from 'hooks/features';
import { useAllGapAnalysis } from 'hooks/gap-analysis';
import {
  useWDPAPreviewLayer,
  usePUGridLayer,
  useFeaturePreviewLayers,
  useBBOX,
  // useTargetedPreviewLayers,
  useCostSurfaceLayer,
  useContinuousFeaturesLayers,
} from 'hooks/map';
import { COLORS } from 'hooks/map/constants';
import { useProject } from 'hooks/projects';
import { useScenario, useScenarioPU } from 'hooks/scenarios';
import { useBestSolution } from 'hooks/solutions';
import { useWDPACategories } from 'hooks/wdpa';

import Button from 'components/button';
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
import { TABS } from 'layout/project/navigation/constants';
import ScenariosDrawingManager from 'layout/scenarios/edit/map/drawing-manager';
import { MapProps } from 'types/map';
import { centerMap } from 'utils/map';

import { useScenarioLegend } from './legend/hooks';

const minZoom = 2;
const maxZoom = 20;

export const ScenariosEditMap = (): JSX.Element => {
  const [open, setOpen] = useState(true);
  const [mapInteractive, setMapInteractive] = useState(false);
  const [mapTilesLoaded, setMapTilesLoaded] = useState(false);

  const mapRef = useRef<mapboxgl.Map | null>(null);

  const { isSidebarOpen } = useAppSelector((state) => state['/projects/[id]']);

  const accessToken = useAccessToken();
  // const queryClient = useQueryClient();

  const { query } = useRouter();

  const { pid, sid, tab } = query as { pid: string; sid: string; tab: string };

  const scenarioSlice = useMemo(() => getScenarioEditSlice(sid), [sid]);
  const {
    setTmpPuIncludedValue,
    setTmpPuExcludedValue,
    setTmpPuAvailableValue,
    setLayerSettings,
    setPuAvailableValue,
    setPuIncludedValue,
    setPuExcludedValue,
    setCache,
  } = scenarioSlice.actions;

  const dispatch = useAppDispatch();

  useScenarioPU(sid, {
    onSuccess: ({ included, excluded, available }) => {
      dispatch(setPuIncludedValue(included));
      dispatch(setPuExcludedValue(excluded));
      dispatch(setPuAvailableValue(available));
    },
  });

  const {
    cache,

    // WDPA
    wdpaThreshold,

    // Features
    features: featuresRecipe,
    featureHoverId,
    selectedFeatures,
    selectedContinuousFeatures,
    preHighlightFeatures,
    postHighlightFeatures,

    selectedCostSurface,

    // Adjust planning units
    clicking,
    puAction,
    puTmpIncludedValue,
    puTmpExcludedValue,
    puTmpAvailableValue,
    puIncludedValue,
    puExcludedValue,
    puAvailableValue,

    // Solutions
    selectedSolution,

    // Settings
    layerSettings,
  } = useAppSelector((state) => state[`/scenarios/${sid}/edit`]);
  const legendConfig = useScenarioLegend();

  const { data } = useProject(pid);
  const { bbox } = data;

  const BBOX = useBBOX({
    bbox,
  });

  const { data: scenarioData } = useScenario(sid);

  const { data: selectedFeaturesData } = useSelectedFeatures(sid, {});
  const { data: targetedFeaturesData } = useTargetedFeatures(sid, {});
  const { data: allGapAnalysisData } = useAllGapAnalysis(sid, {
    enabled: !!sid,
  });
  const { data: projectData } = useProject(pid);
  const { data: protectedAreasData } = useWDPACategories({
    adminAreaId:
      projectData?.adminAreaLevel2Id || projectData?.adminAreaLevel1I || projectData?.countryId,
    customAreaId:
      !projectData?.adminAreaLevel2Id && !projectData?.adminAreaLevel1I && !projectData?.countryId
        ? projectData?.planningAreaId
        : null,
    scenarioId: sid,
  });

  const protectedAreas = protectedAreasData?.filter((a) => a.selected).map((a) => a.name);

  const { data: bestSolutionData } = useBestSolution(sid, {
    enabled: scenarioData?.ranAtLeastOnce,
  });
  const bestSolution = bestSolutionData;

  const costSurfaceQuery = useProjectCostSurface(pid, selectedCostSurface);

  const [viewport, setViewport] = useState({});
  const [bounds, setBounds] = useState<MapProps['bounds']>(null);

  const sublayers = useMemo(() => {
    return [
      ...(layerSettings['wdpa-percentage']?.visibility ? ['wdpa-percentage'] : []),
      ...(layerSettings['features']?.visibility || selectedFeatures?.length ? ['features'] : []),
      ...(preHighlightFeatures?.length || postHighlightFeatures?.length ? ['features'] : []),
      ...(selectedCostSurface ? ['cost'] : []),
      ...(layerSettings['lock-in']?.visibility ? ['lock-in'] : []),
      ...(layerSettings['lock-out']?.visibility ? ['lock-out'] : []),
      ...(layerSettings['lock-available']?.visibility ? ['lock-available'] : []),
      ...(layerSettings['frequency']?.visibility ? ['frequency'] : []),
      ...(layerSettings['solution']?.visibility ? ['solution'] : []),
    ];
  }, [
    layerSettings,
    selectedCostSurface,
    preHighlightFeatures,
    postHighlightFeatures,
    selectedFeatures,
  ]);

  const featuresIds = useMemo(() => {
    if (allGapAnalysisData) {
      return allGapAnalysisData?.map((g) => g.featureId);
    }
    return [];
  }, [allGapAnalysisData]);

  const postHighlightedFeaturesIds = useMemo(() => {
    return postHighlightFeatures.map((h) => {
      return h.replace(`_run${selectedSolution?.runId || bestSolution?.runId}`, '');
    });
  }, [postHighlightFeatures, selectedSolution, bestSolution]);

  const WDPApreviewLayer = useWDPAPreviewLayer({
    WDPACategories: protectedAreasData?.map(({ id }) => id),
    pid,
    cache,
    active: true,
    bbox,
    options: {
      layerSettings,
    },
  });

  const FeaturePreviewLayers = useFeaturePreviewLayers({
    features: selectedFeaturesData,
    cache,
    active: selectedFeatures.length > 0,
    bbox,
    options: {
      featuresRecipe,
      featureHoverId,
      selectedFeatures,
      layerSettings,
    },
  });

  const featureColors = useColorFeatures(pid, sid);

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

  // const TargetedPreviewLayers = useTargetedPreviewLayers({
  //   features: targetedFeaturesData,
  //   cache,
  //   active: targetedFeaturesData?.length > 0,
  //   bbox,
  //   options: {
  //     featuresRecipe,
  //     featureHoverId,
  //     selectedFeatures,
  //     layerSettings,
  //   },
  // });

  const PUGridLayer = usePUGridLayer({
    cache,
    active: true,
    sid,
    include: 'protection,cost,features,results',
    sublayers,
    options: {
      wdpaIucnCategories: protectedAreas,
      wdpaThreshold:
        tab === TABS['scenario-protected-areas']
          ? wdpaThreshold * 100
          : scenarioData?.wdpaThreshold,
      puAction,
      puIncludedValue: [...puIncludedValue, ...puTmpIncludedValue],
      puExcludedValue: [...puExcludedValue, ...puTmpExcludedValue],
      puAvailableValue: [...puAvailableValue, ...puTmpAvailableValue],
      features: [TABS['scenario-features'], TABS['scenario-features-targets-spf']].includes(tab)
        ? []
        : featuresIds,
      preHighlightFeatures,
      postHighlightFeatures: postHighlightedFeaturesIds,
      runId: selectedSolution?.runId || bestSolution?.runId,
      settings: {
        pugrid: layerSettings.pugrid,
        'wdpa-percentage': layerSettings['wdpa-percentage'],
        'features-highlight': layerSettings['features-highlight'],
        cost: layerSettings.cost,
        'lock-in': layerSettings['lock-in'],
        'lock-out': layerSettings['lock-out'],
        'lock-available': layerSettings['lock-available'],
        frequency: layerSettings.frequency,
        solution: layerSettings.solution,
        ...layerSettings,
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

  const continuousFeaturesLayers = useContinuousFeaturesLayers({
    active: selectedContinuousFeatures.length > 0,
    pid,
    features: selectedContinuousFeatures,
    layerSettings,
  });

  const LAYERS = [
    PUGridLayer,
    costSurfaceLayer,
    WDPApreviewLayer,
    ...FeaturePreviewLayers,
    // ...TargetedPreviewLayers,
    ...continuousFeaturesLayers,
  ].filter((l) => !!l);

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
    // ? Previously, with the navigation by tabs, whenever the user clicked to continue, the cache used by the layers on the map
    // ? was updated and the flow continued to the next tab.
    // ? As this flow is gone and the user is free to go wherever they want, we need to update the cache manually when the tab changes.
    if (tab) dispatch(setCache(Date.now()));
  }, [tab, dispatch, setCache]);

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

  const handleClick = useCallback(
    (e) => {
      if (e && e.features) {
        console.info(e.features);
      }

      if (clicking) {
        const { features = [] } = e;

        const pUGridLayer = features.find((f) => f.source === `pu-grid-layer-${cache}`);

        if (pUGridLayer) {
          const { properties } = pUGridLayer;
          const { scenarioPuId } = properties;

          const newClickingValue = [
            ...(puAction === 'include' ? [...puTmpIncludedValue] : []),
            ...(puAction === 'exclude' ? [...puTmpExcludedValue] : []),
            ...(puAction === 'available' ? [...puTmpAvailableValue] : []),
          ];

          const indexAlreadyAddedUnit = newClickingValue.findIndex((s) => s === scenarioPuId);

          if (indexAlreadyAddedUnit > -1) {
            newClickingValue.splice(indexAlreadyAddedUnit, 1);
          } else {
            newClickingValue.push(scenarioPuId);
          }

          const includePU = puTmpIncludedValue.filter((pu) => pu !== scenarioPuId);
          const excludedPU = puTmpExcludedValue.filter((pu) => pu !== scenarioPuId);
          const availablePU = puTmpAvailableValue.filter((pu) => pu !== scenarioPuId);

          switch (puAction) {
            case 'include':
              dispatch(
                setTmpPuIncludedValue(
                  newClickingValue.filter((id) => !puIncludedValue.includes(id))
                )
              );
              dispatch(setTmpPuExcludedValue(excludedPU));
              dispatch(setTmpPuAvailableValue(availablePU));

              dispatch(
                setPuIncludedValue(puIncludedValue.filter((id) => !newClickingValue.includes(id)))
              );
              dispatch(
                setPuAvailableValue(puAvailableValue.filter((id) => !newClickingValue.includes(id)))
              );
              dispatch(
                setPuExcludedValue(puExcludedValue.filter((id) => !newClickingValue.includes(id)))
              );
              break;
            case 'exclude':
              dispatch(
                setTmpPuExcludedValue(
                  newClickingValue.filter((id) => !puExcludedValue.includes(id))
                )
              );
              dispatch(setTmpPuIncludedValue(includePU));
              dispatch(setTmpPuAvailableValue(availablePU));

              dispatch(
                setPuExcludedValue(puExcludedValue.filter((id) => !newClickingValue.includes(id)))
              );

              dispatch(
                setPuIncludedValue(puIncludedValue.filter((id) => !newClickingValue.includes(id)))
              );
              dispatch(
                setPuAvailableValue(puAvailableValue.filter((id) => !newClickingValue.includes(id)))
              );

              break;
            case 'available':
              dispatch(
                setTmpPuAvailableValue(
                  newClickingValue.filter((id) => !puAvailableValue.includes(id))
                )
              );
              dispatch(setTmpPuIncludedValue(includePU));
              dispatch(setTmpPuExcludedValue(excludedPU));

              dispatch(
                setPuExcludedValue(puExcludedValue.filter((id) => !newClickingValue.includes(id)))
              );

              dispatch(
                setPuIncludedValue(puIncludedValue.filter((id) => !newClickingValue.includes(id)))
              );
              dispatch(
                setPuAvailableValue(puAvailableValue.filter((id) => !newClickingValue.includes(id)))
              );
              break;
          }
        }
      }
    },
    [
      clicking,
      puAction,
      puIncludedValue,
      puExcludedValue,
      puAvailableValue,
      puTmpIncludedValue,
      puTmpExcludedValue,
      puTmpAvailableValue,
      dispatch,
      setTmpPuIncludedValue,
      setTmpPuExcludedValue,
      setTmpPuAvailableValue,
      setPuAvailableValue,
      setPuExcludedValue,
      setPuIncludedValue,
      cache,
    ]
  );

  const handleTransformRequest = useCallback(
    (url: string) => {
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

  const onChangeOpacity = useCallback(
    (opacity, id) => {
      dispatch(
        setLayerSettings({
          id,
          settings: {
            opacity,
          },
        })
      );
    },
    [setLayerSettings, dispatch]
  );

  const renderLegendItems = ({
    type,
    intersections,
    items,
  }: {
    type?: LegendItemType;
    intersections?: ComponentProps<typeof LegendTypeMatrix>['intersections'];
    items?:
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

  console.log({ LAYERS });

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

      <div className="absolute bottom-16 right-5 flex w-full max-w-xs flex-col items-end space-y-2">
        <Button
          theme="primary"
          size="base"
          type="button"
          onClick={() => setOpen(!open)}
          className="rounded-full p-5 shadow-xl"
        >
          <FiLayers className="h-6 w-6 text-gray-900" />
        </Button>
        <Legend open={open} className="max-h-[50svh] w-full" onChangeOpen={() => setOpen(!open)}>
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
                                onChangeOpacity={(opacity) => onChangeOpacity(opacity, layer.id)}
                                settings={layerSettings[layer.id]}
                                className="pl-[2px]"
                                {...layer}
                              >
                                {renderLegendItems(layer as any)}
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
      <Loading
        visible={!mapInteractive}
        className="absolute bottom-0 left-0 right-0 top-0 z-40 flex h-full w-full items-center justify-center bg-black bg-opacity-90"
        iconClassName="w-10 h-10 text-primary-500"
      />
    </div>
  );
};

export default ScenariosEditMap;
