import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';

// Map
import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioSlice } from 'store/slices/scenarios/detail';

import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import { LayerManager, Layer } from '@vizzuality/layer-manager-react';
import { useSession } from 'next-auth/client';

import { useSelectedFeatures } from 'hooks/features';
import { useAllGapAnalysis } from 'hooks/gap-analysis';
import {
  usePUGridLayer, useLegend, useFeaturePreviewLayers,
} from 'hooks/map';
import { useProject } from 'hooks/projects';
import { useScenario, useScenarioPU } from 'hooks/scenarios';
import { useBestSolution } from 'hooks/solutions';

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

export interface ScenariosShowMapProps {
}

export const ScenariosMap: React.FC<ScenariosShowMapProps> = () => {
  const [open, setOpen] = useState(true);
  const [session] = useSession();

  const dispatch = useDispatch();

  const { query } = useRouter();
  const { pid, sid } = query;

  const scenarioSlice = getScenarioSlice(sid);
  const { setLayerSettings } = scenarioSlice.actions;

  const {
    tab,
    subtab,
    cache,
    selectedSolution,
    layerSettings,
  } = useSelector((state) => state[`/scenarios/${sid}`]);

  const {
    data = {},
  } = useProject(pid);
  const { bbox } = data;

  const {
    data: scenarioData,
  } = useScenario(sid);
  const { wdpaIucnCategories, wdpaThreshold } = scenarioData || {};

  const {
    data: selectedFeaturesData,
  } = useSelectedFeatures(sid, {});

  const {
    data: PUData,
  } = useScenarioPU(sid);
  const { included, excluded } = PUData || {};

  const {
    data: bestSolutionData,
  } = useBestSolution(sid);
  const bestSolution = bestSolutionData || {};

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
    if (tab === 'protected-areas') return ['wdpa-percentage'];
    if (tab === 'features') return ['wdpa-percentage'];
    if (tab === 'analysis' && subtab === 'analysis-preview') return ['wdpa-percentage', 'features'];
    if (tab === 'analysis' && subtab === 'analysis-gap-analysis') return ['features'];
    if (tab === 'analysis' && subtab === 'analysis-cost-surface') return ['cost'];
    if (tab === 'analysis' && subtab === 'analysis-adjust-planning-units') return ['wdpa-percentage', 'lock-in', 'lock-out'];
    if (tab === 'solutions') return ['solutions'];

    return [];
  }, [tab, subtab]);

  const layers = useMemo(() => {
    if (tab === 'protected-areas' && subtab === 'protected-areas-preview' && !!wdpaIucnCategories?.length) return ['wdpa-preview', 'pugrid'];
    if (tab === 'protected-areas' && subtab === 'protected-areas-percentage' && !!wdpaIucnCategories?.length) return ['wdpa-percentage', 'pugrid'];
    if (tab === 'features') {
      return [
        ...wdpaIucnCategories?.length ? ['wdpa-percentage'] : [],
        'bioregional',
        'species',
        'pugrid',
      ];
    }
    if (tab === 'analysis' && subtab === 'analysis-gap-analysis') return ['features', 'pugrid'];
    if (tab === 'analysis' && subtab === 'analysis-cost-surface') return ['cost', 'pugrid'];
    if (tab === 'analysis' && subtab === 'analysis-adjust-planning-units') return ['wdpa-percentage', 'lock-in', 'lock-out', 'pugrid'];
    if (tab === 'analysis') return ['wdpa-percentage', 'features', 'pugrid'];
    if (tab === 'solutions') return ['frequency', 'solution', 'pugrid'];

    return ['pugrid'];
  }, [tab, subtab, wdpaIucnCategories?.length]);

  const featuresIds = useMemo(() => {
    return allGapAnalysisData.map((g) => g.featureId);
  }, [allGapAnalysisData]);

  const FeaturePreviewLayers = useFeaturePreviewLayers({
    features: selectedFeaturesData,
    cache,
    active: tab === 'features',
    bbox,
    options: {
      settings: {
        bioregional: layerSettings.bioregional,
        species: layerSettings.species,
      },
    },
  });

  const PUGridLayer = usePUGridLayer({
    active: true,
    sid: sid ? `${sid}` : null,
    include,
    sublayers,
    options: {
      wdpaIucnCategories,
      wdpaThreshold,
      puIncludedValue: included,
      puExcludedValue: excluded,
      features: featuresIds,
      runId: selectedSolution?.runId || bestSolution?.runId,
      settings: {
        pugrid: layerSettings.pugrid,
        'wdpa-percentage': layerSettings['wdpa-percentage'],
        cost: layerSettings.cost,
        'lock-in': layerSettings['lock-in'],
        'lock-out': layerSettings['lock-out'],
        frequency: layerSettings.frequency,
        solution: layerSettings.solution,
      },
    },
  });

  const LAYERS = [PUGridLayer, ...FeaturePreviewLayers].filter((l) => !!l);

  const LEGEND = useLegend({
    layers,
    options: {
      wdpaThreshold: scenarioData?.wdpaThreshold,
      puIncludedValue: included,
      puExcludedValue: excluded,
      runId: selectedSolution?.runId || bestSolution?.runId,
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
    if (e && e.features) console.info(e.features);
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
          maxHeight={300}
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

export default ScenariosMap;
