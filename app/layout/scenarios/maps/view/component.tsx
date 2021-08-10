import React, {
  useCallback, useEffect, useState,
} from 'react';

// Map
import { useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioSlice } from 'store/slices/scenarios/detail';

import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import { LayerManager, Layer } from '@vizzuality/layer-manager-react';
import { useSession } from 'next-auth/client';

import { useSelectedFeatures } from 'hooks/features';
import { useWDPAPreviewLayer, usePUGridLayer, useFeaturePreviewLayers } from 'hooks/map';
import { useProject } from 'hooks/projects';
import { useSolution, useBestSolution } from 'hooks/solutions';

import ScenariosDrawingManager from 'layout/scenarios/maps/drawing-manager';

import Map from 'components/map';
// Controls
import Controls from 'components/map/controls';
import FitBoundsControl from 'components/map/controls/fit-bounds';
import ZoomControl from 'components/map/controls/zoom';

export interface ScenariosMapProps {
}

export const ScenariosMap: React.FC<ScenariosMapProps> = () => {
  const [session] = useSession();

  const { query } = useRouter();
  const { pid, sid } = query;

  const { data = {} } = useProject(pid);
  const { bbox } = data;

  const {
    data: selectedFeaturesData,
  } = useSelectedFeatures(sid, {});

  getScenarioSlice(sid);
  const { selectedSolutionId } = useSelector((state) => state[`/scenarios/${sid}`]);

  const {
    data: selectedSolutionData,
  } = useSolution(sid, selectedSolutionId);

  const {
    data: bestSolutionData,
  } = useBestSolution(sid);

  const {
    tab,
    subtab,
    cache,
    // WDPA
    wdpaCategories,
    wdpaThreshold,

    // Features
    featureHoverId,
    // Adjust planning units
    puAction,
    puTmpIncludedValue,
    puTmpExcludedValue,
  } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const minZoom = 2;
  const maxZoom = 20;
  const [viewport, setViewport] = useState({});
  const [bounds, setBounds] = useState(null);

  const WDPApreviewLayer = useWDPAPreviewLayer({
    ...wdpaCategories,
    cache,
    active: tab === 'protected-areas' && subtab === 'protected-areas-preview',
    bbox,
  });

  const FeaturePreviewLayers = useFeaturePreviewLayers({
    features: selectedFeaturesData,
    cache,
    active: tab === 'features',
    bbox,
    options: {
      featureHoverId,
    },
  });

  const PUGridLayer = usePUGridLayer({
    cache,
    active: true,
    sid: sid ? `${sid}` : null,
    type: tab,
    subtype: subtab,
    runId: selectedSolutionData?.runId || bestSolutionData?.runId,
    options: {
      wdpaThreshold,
      puAction,
      puIncludedValue: puTmpIncludedValue,
      puExcludedValue: puTmpExcludedValue,
    },
  });

  const LAYERS = [PUGridLayer, WDPApreviewLayer, ...FeaturePreviewLayers].filter((l) => !!l);

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
    </div>
  );
};

export default ScenariosMap;
