import React, {
  useCallback, useEffect, useState, useMemo,
} from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import { LayerManager, Layer } from '@vizzuality/layer-manager-react';
import { useSession } from 'next-auth/client';

import { useSelectedFeatures } from 'hooks/features';
import { useAllGapAnalysis } from 'hooks/gap-analysis';
import {
  useWDPAPreviewLayer, usePUGridLayer, useFeaturePreviewLayers, useLegend,
} from 'hooks/map';
import { useProject } from 'hooks/projects';
import { useCostSurfaceRange, useScenario } from 'hooks/scenarios';

import ScenariosDrawingManager from 'layout/scenarios/edit/map/drawing-manager';

// Map
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

export interface ScenariosEditMapProps {
}

export const ScenariosEditMap: React.FC<ScenariosEditMapProps> = () => {
  const [open, setOpen] = useState(true);
  const [session] = useSession();

  const { query } = useRouter();
  const { pid, sid } = query;

  const scenarioSlice = getScenarioEditSlice(sid);
  const {
    setTmpPuIncludedValue,
    setTmpPuExcludedValue,
    setLayerSettings,
  } = scenarioSlice.actions;

  const dispatch = useDispatch();

  const {
    tab,
    subtab,
    cache,

    // WDPA
    wdpaCategories,
    wdpaThreshold,

    // Features
    features: featuresRecipe,
    featureHoverId,
    highlightFeatures,

    // Adjust planning units
    clicking,
    puAction,
    puTmpIncludedValue,
    puTmpExcludedValue,

    // Settings
    layerSettings,
  } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const { data = {} } = useProject(pid);
  const { bbox } = data;

  const {
    data: scenarioData,
  } = useScenario(sid);

  const {
    data: selectedFeaturesData,
  } = useSelectedFeatures(sid, {});

  const {
    data: costSurfaceRangeData,
  } = useCostSurfaceRange(sid);

  const {
    data: allGapAnalysisData,
  } = useAllGapAnalysis(sid, {
    enabled: !!sid,
  });

  const minZoom = 2;
  const maxZoom = 20;
  const [viewport, setViewport] = useState({});
  const [bounds, setBounds] = useState(null);

  const include = useMemo(() => {
    if (tab === 'protected-areas' || tab === 'features') return 'protection';
    if (tab === 'analysis' && subtab === 'analysis-preview') return 'protection,features';
    if (tab === 'analysis' && subtab === 'analysis-gap-analysis') return 'features';
    if (tab === 'analysis' && subtab === 'analysis-cost-surface') return 'cost';
    if (tab === 'analysis' && subtab === 'analysis-adjust-planning-units') return 'lock-status,protection';
    if (tab === 'solutions') return 'results';

    return 'protection';
  }, [tab, subtab]);

  const sublayers = useMemo(() => {
    if (tab === 'protected-areas' && subtab === 'protected-areas-percentage') return ['wdpa-percentage'];
    if (tab === 'features') return ['wdpa-percentage'];
    if (tab === 'analysis' && subtab === 'analysis-preview') return ['wdpa-percentage', 'features'];
    if (tab === 'analysis' && subtab === 'analysis-gap-analysis') return ['features'];
    if (tab === 'analysis' && subtab === 'analysis-cost-surface') return ['cost'];
    if (tab === 'analysis' && subtab === 'analysis-adjust-planning-units') return ['wdpa-percentage', 'lock-in', 'lock-out'];

    return [];
  }, [tab, subtab]);

  const layers = useMemo(() => {
    const protectedCategories = wdpaCategories?.wdpaIucnCategories
    || scenarioData?.wdpaIucnCategories
    || [];

    if (tab === 'protected-areas' && subtab === 'protected-areas-preview' && !!protectedCategories.length) return ['wdpa-preview', 'pugrid'];
    if (tab === 'protected-areas' && subtab === 'protected-areas-percentage' && !!protectedCategories.length) return ['wdpa-percentage', 'pugrid'];
    if (tab === 'features') {
      return [
        ...protectedCategories.length ? ['wdpa-percentage'] : [],
        'bioregional',
        'species',
        'pugrid',
      ];
    }
    if (tab === 'analysis' && subtab === 'analysis-gap-analysis') return ['features', 'pugrid'];
    if (tab === 'analysis' && subtab === 'analysis-cost-surface') return ['cost', 'pugrid'];
    if (tab === 'analysis' && subtab === 'analysis-adjust-planning-units') return ['wdpa-percentage', 'lock-in', 'lock-out', 'pugrid'];
    if (tab === 'analysis') return ['wdpa-percentage', 'features', 'pugrid'];

    return ['pugrid'];
  }, [tab, subtab, wdpaCategories?.wdpaIucnCategories, scenarioData?.wdpaIucnCategories]);

  const featuresIds = useMemo(() => {
    if (allGapAnalysisData) {
      return allGapAnalysisData.map((g) => g.featureId);
    }
    return [];
  }, [allGapAnalysisData]);

  const WDPApreviewLayer = useWDPAPreviewLayer({
    ...wdpaCategories,
    cache,
    active: tab === 'protected-areas' && subtab === 'protected-areas-preview',
    bbox,
    options: {
      ...layerSettings['wdpa-preview'],
    },
  });

  const FeaturePreviewLayers = useFeaturePreviewLayers({
    features: selectedFeaturesData,
    cache,
    active: tab === 'features',
    bbox,
    options: {
      featuresRecipe,
      featureHoverId,
      settings: {
        bioregional: layerSettings.bioregional,
        species: layerSettings.species,
      },
    },
  });

  const PUGridLayer = usePUGridLayer({
    cache,
    active: true,
    sid: sid ? `${sid}` : null,
    include,
    sublayers,
    options: {
      wdpaIucnCategories: tab === 'protected-areas' && subtab === 'protected-areas-preview' ? wdpaCategories.wdpaIucnCategories : scenarioData?.wdpaIucnCategories,
      wdpaThreshold: tab === 'protected-areas' && subtab === 'protected-areas-percentage' ? wdpaThreshold * 100 : scenarioData?.wdpaThreshold,
      puAction,
      puIncludedValue: puTmpIncludedValue,
      puExcludedValue: puTmpExcludedValue,
      features: featuresIds,
      highlightFeatures,
      cost: costSurfaceRangeData,
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

  const LAYERS = [PUGridLayer, WDPApreviewLayer, ...FeaturePreviewLayers].filter((l) => !!l);

  const LEGEND = useLegend({
    layers,
    options: {
      wdpaIucnCategories: tab === 'protected-areas' && subtab === 'protected-areas-preview' ? wdpaCategories.wdpaIucnCategories : scenarioData?.wdpaIucnCategories,
      wdpaThreshold: tab === 'protected-areas' && subtab === 'protected-areas-percentage' ? wdpaThreshold : scenarioData?.wdpaThreshold,
      cost: costSurfaceRangeData,
      puAction,
      puIncludedValue: puTmpIncludedValue,
      puExcludedValue: puTmpExcludedValue,
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

  const handleClick = useCallback((e) => {
    if (e && e.features) {
      console.info(e.features);
    }

    if (clicking) {
      const { features = [] } = e;

      const pUGridLayer = features.find((f) => f.source === `pu-grid-layer-${cache}`);

      if (pUGridLayer) {
        const { properties } = pUGridLayer;
        const { scenarioPuId } = properties;

        const newClickingValue = puAction === 'include' ? [...puTmpIncludedValue] : [...puTmpExcludedValue];
        const newAction = puAction === 'include' ? setTmpPuIncludedValue : setTmpPuExcludedValue;

        const newOpositeClickingValue = puAction !== 'include' ? [...puTmpIncludedValue] : [...puTmpExcludedValue];
        const newOpositeAction = puAction !== 'include' ? setTmpPuIncludedValue : setTmpPuExcludedValue;

        const index = newClickingValue.findIndex((s) => s === scenarioPuId);
        const indexOposite = newOpositeClickingValue.findIndex((s) => s === scenarioPuId);

        if (index > -1) {
          newClickingValue.splice(index, 1);
        } else {
          newClickingValue.push(scenarioPuId);
        }

        if (indexOposite > -1) {
          newOpositeClickingValue.splice(indexOposite, 1);
          dispatch(newOpositeAction(newOpositeClickingValue));
        }

        dispatch(newAction(newClickingValue));
      }
    }
  }, [
    clicking,
    puAction,
    puTmpIncludedValue,
    puTmpExcludedValue,
    dispatch,
    setTmpPuIncludedValue,
    setTmpPuExcludedValue,
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

  const onChangeOpacity = useCallback((opacity, id) => {
    dispatch(setLayerSettings({
      id,
      settings: { opacity },
    }));
  }, [setLayerSettings, dispatch]);

  const onChangeVisibility = useCallback((id) => {
    const { visibility = true } = layerSettings[id] || {};
    dispatch(setLayerSettings({
      id,
      settings: { visibility: !visibility },
    }));
  }, [setLayerSettings, dispatch, layerSettings]);

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
              type, items, intersections, id,
            } = i;

            return (
              <LegendItem
                sortable={false}
                key={i.id}
                settingsManager={i.settingsManager}
                onChangeOpacity={(opacity) => onChangeOpacity(opacity, id)}
                onChangeVisibility={() => onChangeVisibility(id)}
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
    </div>
  );
};

export default ScenariosEditMap;
