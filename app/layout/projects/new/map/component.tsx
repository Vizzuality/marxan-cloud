import React, { useCallback, useEffect, useState } from 'react';

import { LayerManager, Layer } from '@vizzuality/layer-manager-react';
import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';

// Map
import Map from 'components/map';

// Controls
import Controls from 'components/map/controls';
import ZoomControl from 'components/map/controls/zoom';
import FitBoundsControl from 'components/map/controls/fit-bounds';

import { useSelector } from 'react-redux';
import { useSession } from 'next-auth/client';
import { useAdminPreviewLayer, usePUGridPreviewLayer, useGeoJsonLayer } from 'hooks/map';

import ProjectMapProps from './types';

export const ProjectNewMap: React.FC<ProjectMapProps> = ({
  country,
  region,
  subregion,
  planningUnitAreakm2,
  planningUnitGridShape,
}: ProjectMapProps) => {
  const minZoom = 2;
  const maxZoom = 20;
  const { bbox, uploadingValue } = useSelector((state) => state['/projects/new']);

  const [viewport, setViewport] = useState({});
  const [bounds, setBounds] = useState(null);

  const [session] = useSession();

  const LAYERS = [
    useGeoJsonLayer({
      id: 'uploaded-geojson',
      active: !!uploadingValue,
      data: uploadingValue,
    }),
    useAdminPreviewLayer({
      active: true,
      country,
      region,
      subregion,
    }),
    usePUGridPreviewLayer({
      active: true,
      bbox,
      planningUnitGridShape,
      planningUnitAreakm2,
    }),
  ].filter((l) => !!l);

  useEffect(() => {
    if (bbox) {
      setBounds({
        bbox,
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

export default ProjectNewMap;
