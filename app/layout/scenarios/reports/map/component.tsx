import React, {
  useCallback, useEffect, useState, useMemo,
} from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import { LayerManager, Layer } from '@vizzuality/layer-manager-react';
import { ScenarioSidebarTabs, ScenarioSidebarSubTabs } from 'utils/tabs';

import { useAccessToken } from 'hooks/auth';
import { useAllGapAnalysis } from 'hooks/gap-analysis';
import {
  usePUGridLayer,
} from 'hooks/map';
import { useProject } from 'hooks/projects';
import { useCostSurfaceRange, useScenario } from 'hooks/scenarios';
import { useBestSolution } from 'hooks/solutions';

import ScenariosDrawingManager from 'layout/scenarios/edit/map/drawing-manager';

import Loading from 'components/loading';
import Map from 'components/map';

export interface ScenariosReportMapProps {
}

export const ScenariosReportMap: React.FC<ScenariosReportMapProps> = () => {
  const [mapInteractive, setMapInteractive] = useState(false);

  const accessToken = useAccessToken();

  const { query } = useRouter();

  const { pid, sid } = query;

  const scenarioSlice = getScenarioEditSlice(sid);
  const {
    setTmpPuIncludedValue,
    setTmpPuExcludedValue,
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
    preHighlightFeatures,
    postHighlightFeatures,

    // Adjust planning units
    clicking,
    puAction,
    puTmpIncludedValue,
    puTmpExcludedValue,

    // Solutions
    selectedSolution,

    // Settings
    layerSettings,
  } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const {
    data = {},
  } = useProject(pid);
  const { bbox } = data;

  const {
    data: scenarioData,
  } = useScenario(sid);

  const {
    data: costSurfaceRangeData,
  } = useCostSurfaceRange(sid);

  const {
    data: allGapAnalysisData,
  } = useAllGapAnalysis(sid, {
    enabled: !!sid,
  });

  const {
    data: bestSolutionData,
  } = useBestSolution(sid, {
    enabled: scenarioData?.ranAtLeastOnce,
  });
  const bestSolution = bestSolutionData;

  const minZoom = 2;
  const maxZoom = 20;
  const [viewport, setViewport] = useState({});
  const [bounds, setBounds] = useState(null);

  const include = useMemo(() => {
    if (tab === ScenarioSidebarTabs.PLANNING_UNIT && subtab === null) return 'lock-status,protection';
    if (tab === ScenarioSidebarTabs.PLANNING_UNIT && subtab === ScenarioSidebarSubTabs.PROTECTED_AREAS_PREVIEW) return 'protection';
    if (tab === ScenarioSidebarTabs.PLANNING_UNIT && subtab === ScenarioSidebarSubTabs.COST_SURFACE) return 'cost';
    if (tab === ScenarioSidebarTabs.PLANNING_UNIT && subtab === ScenarioSidebarSubTabs.ADJUST_PLANNING_UNITS) return 'lock-status,protection';

    if (tab === ScenarioSidebarTabs.PARAMETERS) return 'protection,features';

    if (tab === ScenarioSidebarTabs.SOLUTIONS && subtab !== ScenarioSidebarSubTabs.POST_GAP_ANALYSIS) return 'results';
    if (tab === ScenarioSidebarTabs.SOLUTIONS && subtab === ScenarioSidebarSubTabs.POST_GAP_ANALYSIS) return 'results,features';

    return 'protection';
  }, [tab, subtab]);

  const sublayers = useMemo(() => {
    if (tab === ScenarioSidebarTabs.PLANNING_UNIT && subtab === null) return ['wdpa-percentage', 'lock-in', 'lock-out'];
    if (tab === ScenarioSidebarTabs.PLANNING_UNIT && subtab === ScenarioSidebarSubTabs.PROTECTED_AREAS_THRESHOLD) return ['wdpa-percentage'];
    if (tab === ScenarioSidebarTabs.PLANNING_UNIT && subtab === ScenarioSidebarSubTabs.COST_SURFACE) return ['cost'];
    if (tab === ScenarioSidebarTabs.PLANNING_UNIT && subtab === ScenarioSidebarSubTabs.ADJUST_PLANNING_UNITS) return ['wdpa-percentage', 'lock-in', 'lock-out'];

    if (tab === ScenarioSidebarTabs.FEATURES) return ['wdpa-percentage'];

    if (tab === ScenarioSidebarTabs.PARAMETERS) return ['wdpa-percentage', 'features'];

    if (tab === ScenarioSidebarTabs.SOLUTIONS && subtab !== ScenarioSidebarSubTabs.POST_GAP_ANALYSIS) return ['solutions'];

    return [];
  }, [tab, subtab]);

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

  const PUGridLayer = usePUGridLayer({
    cache,
    active: true,
    sid: sid ? `${sid}` : null,
    include,
    sublayers,
    options: {
      wdpaIucnCategories: tab === ScenarioSidebarTabs.PLANNING_UNIT
        ? wdpaCategories.wdpaIucnCategories : scenarioData?.wdpaIucnCategories,
      wdpaThreshold: tab === ScenarioSidebarTabs.PLANNING_UNIT
        && subtab === ScenarioSidebarSubTabs.PROTECTED_AREAS_THRESHOLD
        ? wdpaThreshold * 100 : scenarioData?.wdpaThreshold,
      puAction,
      puIncludedValue: puTmpIncludedValue,
      puExcludedValue: puTmpExcludedValue,
      features: featuresIds,
      preHighlightFeatures,
      postHighlightFeatures: postHighlightedFeaturesIds,
      cost: costSurfaceRangeData,
      runId: selectedSolution?.runId || bestSolution?.runId,
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

  const LAYERS = [
    PUGridLayer,
  ].filter((l) => !!l);

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
          Authorization: `Bearer ${accessToken}`,
        },
      };
    }
    return null;
  };

  return (
    <>
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
      </div>
      <Loading
        visible={!mapInteractive}
        className="absolute top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center w-full h-full bg-black bg-opacity-90"
        iconClassName="w-10 h-10 text-primary-500"
      />
    </>
  );
};

export default ScenariosReportMap;
