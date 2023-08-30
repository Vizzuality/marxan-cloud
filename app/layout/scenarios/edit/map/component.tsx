import React, { useCallback, useEffect, useState, useMemo } from 'react';

import { useRouter } from 'next/router';

import { useAppSelector, useAppDispatch } from 'store/hooks';
import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import { LayerManager, Layer } from '@vizzuality/layer-manager-react';

import { useAccessToken } from 'hooks/auth';
import { useSelectedFeatures, useTargetedFeatures } from 'hooks/features';
import { useAllGapAnalysis } from 'hooks/gap-analysis';
import {
  // usePUGridPreviewLayer,
  // useAdminPreviewLayer,
  useWDPAPreviewLayer,
  usePUGridLayer,
  useFeaturePreviewLayers,
  useLegend,
  useBBOX,
  useTargetedPreviewLayers,
} from 'hooks/map';
import { useProject } from 'hooks/projects';
import { useCostSurfaceRange, useScenario } from 'hooks/scenarios';
import { useBestSolution } from 'hooks/solutions';
import { useWDPACategories } from 'hooks/wdpa';

import Loading from 'components/loading';
import Map from 'components/map';
// Controls
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
import { TABS } from 'layout/project/navigation/constants';
import ScenariosDrawingManager from 'layout/scenarios/edit/map/drawing-manager';

export const ScenariosEditMap = (): JSX.Element => {
  const [open, setOpen] = useState(true);
  const [mapInteractive, setMapInteractive] = useState(false);
  const [mapTilesLoaded, setMapTilesLoaded] = useState(false);

  const accessToken = useAccessToken();

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

  const {
    cache,

    // WDPA
    wdpaCategories,
    wdpaThreshold,

    // Features
    features: featuresRecipe,
    featureHoverId,
    selectedFeatures,
    preHighlightFeatures,
    postHighlightFeatures,

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

  const { data = {} } = useProject(pid);
  const { bbox } = data;

  const BBOX = useBBOX({
    bbox,
  });

  const { data: scenarioData } = useScenario(sid);

  const { data: selectedFeaturesData } = useSelectedFeatures(sid, {});

  const { data: targetedFeaturesData } = useTargetedFeatures(sid, {});

  const previewFeatureIsSelected = useMemo(() => {
    if (tab === TABS['scenario-features']) {
      return (
        (selectedFeaturesData || []).filter(({ id }) => selectedFeatures.includes(id)).length > 0
      );
    }

    if (tab === TABS['scenario-features-targets-spf']) {
      return (
        (targetedFeaturesData || []).filter(({ id }) => selectedFeatures.includes(id)).length > 0
      );
    }

    return false;
  }, [tab, selectedFeaturesData, targetedFeaturesData, selectedFeatures]);

  const selectedPreviewFeatures = useMemo(() => {
    if (tab === TABS['scenario-features']) {
      return (selectedFeaturesData || [])
        .filter(({ id }) => selectedFeatures.includes(id))
        .map(({ name, id }) => ({ name, id }))
        .sort((a, b) => {
          const aIndex = selectedFeatures.indexOf(a.id as string);
          const bIndex = selectedFeatures.indexOf(b.id as string);
          return aIndex - bIndex;
        });
    }

    if (tab === TABS['scenario-features-targets-spf']) {
      return (targetedFeaturesData || [])
        .filter(({ id }) => selectedFeatures.includes(id))
        .map(({ name, id }) => ({ name, id }))
        .sort((a, b) => {
          const aIndex = selectedFeatures.indexOf(a.id as string);
          const bIndex = selectedFeatures.indexOf(b.id as string);
          return aIndex - bIndex;
        });
    }

    return [];
  }, [tab, selectedFeaturesData, targetedFeaturesData, selectedFeatures]);

  const { data: costSurfaceRangeData } = useCostSurfaceRange(sid);

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

  const minZoom = 2;
  const maxZoom = 20;
  const [viewport, setViewport] = useState({});
  const [bounds, setBounds] = useState(null);

  const include = useMemo(() => {
    if (tab === TABS['scenario-protected-areas']) {
      return 'protection';
    }

    if (tab === TABS['scenario-cost-surface']) {
      return 'cost';
    }

    if (tab === TABS['scenario-gap-analysis']) {
      return 'features';
    }

    if ([TABS['scenario-advanced-settings'], TABS['scenario-blm-calibration']].includes(tab)) {
      return 'protection,features';
    }

    if (tab === TABS['scenario-solutions']) {
      return 'results';
    }

    if (tab === TABS['scenario-target-achievement']) {
      return 'results,features';
    }

    return 'protection';
  }, [tab]);

  const sublayers = useMemo(() => {
    if (tab === TABS['scenario-protected-areas']) {
      return ['wdpa-percentage'];
    }

    if (tab === TABS['scenario-cost-surface']) {
      return ['cost'];
    }

    if (tab === TABS['scenario-planning-unit-status']) {
      return ['wdpa-percentage', 'lock-available', 'lock-in', 'lock-out'];
    }

    if ([TABS['scenario-features'], TABS['scenario-features-targets-spf']].includes(tab)) {
      return ['wdpa-percentage', 'features', 'features-preview'];
    }

    if (tab === TABS['scenario-gap-analysis']) {
      return ['features'];
    }

    if ([TABS['scenario-advanced-settings'], TABS['scenario-blm-calibration']].includes(tab)) {
      return ['wdpa-percentage', 'features'];
    }

    if ([TABS['scenario-solutions'], TABS['scenario-target-achievement']].includes(tab)) {
      return ['frequency', 'solution'];
    }

    return [];
  }, [tab]);

  const layers = useMemo(() => {
    const protectedCategories = protectedAreas || [];

    if (tab === TABS['scenario-cost-surface']) {
      return ['cost', 'pugrid'];
    }
    if (tab === TABS['scenario-planning-unit-status']) {
      return [
        ...(protectedCategories.length ? ['wdpa-percentage'] : []),
        'lock-available',
        'lock-in',
        'lock-out',
        'pugrid',
      ];
    }

    if (tab === TABS['scenario-protected-areas'] && !!protectedCategories.length) {
      return ['wdpa-percentage', 'wdpa-preview', 'pugrid'];
    }

    if ([TABS['scenario-features'], TABS['scenario-features-targets-spf']].includes(tab)) {
      return [
        ...(protectedCategories.length ? ['wdpa-percentage'] : []),
        ...(preHighlightFeatures.length ? ['features-highlight'] : []),
        !!previewFeatureIsSelected && 'features-preview',
        'pugrid',
      ];
    }

    if (tab === TABS['scenario-gap-analysis']) {
      return ['features', 'pugrid'];
    }

    if ([TABS['scenario-advanced-settings'], TABS['scenario-blm-calibration']].includes(tab)) {
      return ['wdpa-percentage', 'features'];
    }

    if ([TABS['scenario-solutions'], TABS['scenario-target-achievement']].includes(tab)) {
      return ['frequency', 'solution', 'pugrid'];
    }

    if (
      [TABS['scenario-solutions'], TABS['scenario-target-achievement']].includes(tab) &&
      !postHighlightFeatures.length
    ) {
      return ['features'];
    }

    if (
      [TABS['scenario-solutions'], TABS['scenario-target-achievement']].includes(tab) &&
      !!postHighlightFeatures.length
    ) {
      return ['features', 'features-highlight'];
    }

    return ['pugrid'];
  }, [
    tab,
    protectedAreas,
    previewFeatureIsSelected,
    preHighlightFeatures.length,
    postHighlightFeatures.length,
  ]);

  const featuresIds = useMemo(() => {
    if (allGapAnalysisData) {
      return allGapAnalysisData.map((g) => g.featureId);
    }
    return [];
  }, [allGapAnalysisData]);

  const postHighlightedFeaturesIds = useMemo(() => {
    return postHighlightFeatures.map((h) => {
      return h.replace(`_run${selectedSolution?.runId || bestSolution?.runId}`, '');
    });
  }, [postHighlightFeatures, selectedSolution, bestSolution]);

  const WDPApreviewLayer = useWDPAPreviewLayer({
    ...wdpaCategories,
    pid: `${pid}`,
    cache,
    active: tab === TABS['scenario-protected-areas'],
    bbox,
    options: {
      ...layerSettings['wdpa-preview'],
    },
  });

  const FeaturePreviewLayers = useFeaturePreviewLayers({
    features: selectedFeaturesData,
    cache,
    active: tab === TABS['scenario-features'],
    bbox,
    options: {
      featuresRecipe,
      featureHoverId,
      selectedFeatures,
      ...layerSettings['features-preview'],
    },
  });

  const TargetedPreviewLayers = useTargetedPreviewLayers({
    features: targetedFeaturesData,
    cache,
    active: tab === TABS['scenario-features-targets-spf'],
    bbox,
    options: {
      featuresRecipe,
      featureHoverId,
      selectedFeatures,
      ...layerSettings['features-preview'],
    },
  });

  const PUGridLayer = usePUGridLayer({
    cache,
    active: true,
    sid: sid ? `${sid}` : null,
    include,
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
      features: featuresIds,
      preHighlightFeatures,
      postHighlightFeatures: postHighlightedFeaturesIds,
      cost: costSurfaceRangeData,
      runId: selectedSolution?.runId || bestSolution?.runId,
      settings: {
        pugrid: layerSettings.pugrid,
        'wdpa-percentage': layerSettings['wdpa-percentage'],
        features: layerSettings.features,
        'features-highlight': layerSettings['features-highlight'],
        cost: layerSettings.cost,
        'lock-in': layerSettings['lock-in'],
        'lock-out': layerSettings['lock-out'],
        'lock-available': layerSettings['lock-available'],
        frequency: layerSettings.frequency,
        solution: layerSettings.solution,
      },
    },
  });

  const LAYERS = [
    // PUGridPreviewLayer,
    // AdminPreviewLayer,
    PUGridLayer,
    WDPApreviewLayer,
    ...FeaturePreviewLayers,
    ...TargetedPreviewLayers,
  ].filter((l) => !!l);

  const LEGEND = useLegend({
    layers,
    options: {
      wdpaIucnCategories: protectedAreas,
      wdpaThreshold:
        tab === TABS['scenario-protected-areas'] ? wdpaThreshold : scenarioData?.wdpaThreshold,
      cost: costSurfaceRangeData,
      items: selectedPreviewFeatures,
      puAction,
      puIncludedValue: [...puIncludedValue, ...puTmpIncludedValue],
      puExcludedValue: [...puExcludedValue, ...puTmpExcludedValue],
      puAvailableValue: [...puAvailableValue, ...puTmpAvailableValue],
      runId: selectedSolution?.runId || bestSolution?.runId,
      numberOfRuns: scenarioData?.numberOfRuns || 0,
      layerSettings,
    },
  });

  useEffect(() => {
    setBounds({
      bbox: BBOX,
      options: { padding: { top: 50, right: 50, bottom: 50, left: 575 } },
      viewportOptions: { transitionDuration: 0 },
    });
  }, [BBOX]);

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

  const onChangeOpacity = useCallback(
    (opacity, id) => {
      dispatch(
        setLayerSettings({
          id,
          settings: { opacity },
        })
      );
    },
    [setLayerSettings, dispatch]
  );

  const onChangeVisibility = useCallback(
    (id) => {
      const { visibility = true } = layerSettings[id] || {};
      dispatch(
        setLayerSettings({
          id,
          settings: { visibility: !visibility },
        })
      );
    },
    [setLayerSettings, dispatch, layerSettings]
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
        onMapLoad={() => setMapInteractive(true)}
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
        <Legend open={open} className="w-full" maxHeight={325} onChangeOpen={() => setOpen(!open)}>
          {LEGEND.map((i) => {
            const { type, items, intersections, id } = i;

            return (
              <LegendItem
                sortable={false}
                key={i.id}
                settingsManager={i.settingsManager}
                onChangeOpacity={(opacity) => onChangeOpacity(opacity, id)}
                onChangeVisibility={() => onChangeVisibility(id)}
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
                  <LegendTypeGradient className={{ box: 'text-sm text-gray-300' }} items={items} />
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

export default ScenariosEditMap;
