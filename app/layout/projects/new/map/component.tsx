import React, { useCallback, useEffect, useState } from 'react';

import { useSelector } from 'react-redux';

import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import { LayerManager, Layer } from '@vizzuality/layer-manager-react';

// Map
import { useAccessToken } from 'hooks/auth';
import {
  useGeoJsonLayer,
  useAdminPreviewLayer,
  usePUGridPreviewLayer,
  usePlanningAreaPreviewLayer,
  useGridPreviewLayer,
  useBBOX,
} from 'hooks/map';

import Loading from 'components/loading';
import Map from 'components/map';
// Controls
import Controls from 'components/map/controls';
import FitBoundsControl from 'components/map/controls/fit-bounds';
import LoadingControl from 'components/map/controls/loading';
import ZoomControl from 'components/map/controls/zoom';

import ProjectMapProps from './types';

export const ProjectNewMap: React.FC<ProjectMapProps> = ({
  country,
  region,
  subregion,
  planningUnitAreakm2,
  planningUnitGridShape,
  paOptionSelected,
}: ProjectMapProps) => {
  const minZoom = 2;
  const maxZoom = 20;
  const {
    bbox, uploadingPlanningArea, uploadingPlanningAreaId, uploadingGridId,
  } = useSelector((state) => state['/projects/new']);

  const BBOX = useBBOX({ bbox });

  const [viewport, setViewport] = useState({});
  const [bounds, setBounds] = useState(null);
  const [mapInteractive, setMapInteractive] = useState(false);
  const [mapTilesLoaded, setMapTilesLoaded] = useState(false);

  const accessToken = useAccessToken();

  const LAYERS = [
    useGeoJsonLayer({
      id: 'uploaded-geojson',
      active: !!uploadingPlanningArea,
      data: uploadingPlanningArea,
      options: {
        customPAshapefileGrid: paOptionSelected === 'customPAshapefileGrid',
      },
    }),
    usePlanningAreaPreviewLayer({
      active: !!uploadingPlanningAreaId,
      planningAreaId: uploadingPlanningAreaId,
    }),
    useGridPreviewLayer({
      active: !!uploadingGridId,
      gridId: uploadingGridId,
    }),
    useAdminPreviewLayer({
      active: true,
      country,
      region,
      subregion,
    }),
    usePUGridPreviewLayer({
      active: paOptionSelected !== 'customPAshapefileGrid',
      bbox,
      planningUnitGridShape,
      planningUnitAreakm2,
    }),
  ].filter((l) => !!l);

  useEffect(() => {
    if (BBOX) {
      setBounds({
        bbox: BBOX,
        options: {
          padding: 50,
        },
        viewportOptions: {
          transitionDuration: 1000,
        },
      });
    } else {
      setBounds(null);
    }
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
          Authorization: `Bearer ${accessToken}`,
        },
      };
    }

    return null;
  };

  return (
    <div
      id="project-new-map"
      className="relative w-full h-full overflow-hidden rounded-r-3xl"
    >
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
        onMapTilesLoaded={(loaded) => setMapTilesLoaded(loaded)}
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

      <Controls>
        <LoadingControl
          loading={!mapTilesLoaded}
        />
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
      <Loading
        visible={!mapInteractive}
        className="absolute top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center w-full h-full bg-black bg-opacity-90"
        iconClassName="w-10 h-10 text-primary-500"
      />
    </div>
  );
};

export default ProjectNewMap;
