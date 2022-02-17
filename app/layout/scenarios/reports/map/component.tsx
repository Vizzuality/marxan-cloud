import React, {
  useCallback, useEffect, useState, useMemo,
} from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import { LayerManager, Layer } from '@vizzuality/layer-manager-react';

import { useAccessToken } from 'hooks/auth';
import {
  usePUGridLayer,
} from 'hooks/map';
import { useProject } from 'hooks/projects';
import { useScenario } from 'hooks/scenarios';
import { useBestSolution } from 'hooks/solutions';

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
    cache,

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
    return 'results';
  }, []);

  const sublayers = useMemo(() => {
    return ['solutions'];
  }, []);

  const PUGridLayer = usePUGridLayer({
    cache,
    active: true,
    sid: sid ? `${sid}` : null,
    include,
    sublayers,
    options: {
      puAction,
      puIncludedValue: puTmpIncludedValue,
      puExcludedValue: puTmpExcludedValue,
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
      <div className="relative w-full h-full overflow-hidden">
        <Map
          scrollZoom={false}
          touchZoom={false}
          dragPan={false}
          dragRotate={false}
          touchRotate={false}
          bounds={bounds}
          width="100%"
          height="100%"
          minZoom={minZoom}
          maxZoom={maxZoom}
          viewport={viewport}
          onClick={handleClick}
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
      <Loading
        visible={!mapInteractive}
        className="absolute top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center w-full h-full bg-black bg-opacity-90"
        iconClassName="w-10 h-10 text-primary-500"
      />
    </>
  );
};

export default ScenariosReportMap;
