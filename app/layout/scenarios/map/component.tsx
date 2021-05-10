import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';

// Map
import Map from 'components/map';
import LAYERS from 'components/map/layers';

import { LayerManager, Layer } from 'layer-manager/dist/components';
import { PluginMapboxGl } from 'layer-manager';

import {
  Editor,
  EditingMode,
  DrawPolygonMode,
} from 'react-map-gl-draw';

// Controls
import Controls from 'components/map/controls';
import ZoomControl from 'components/map/controls/zoom';
import FitBoundsControl from 'components/map/controls/fit-bounds';

import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';
import { getScenarioSlice } from 'store/slices/scenarios/edit';

export interface ScenariosMapProps {
}

export const ScenariosMap: React.FC<ScenariosMapProps> = () => {
  const { query } = useRouter();
  const { sid } = query;
  const editorRef = useRef(null);

  const minZoom = 2;
  const maxZoom = 20;
  const [viewport, setViewport] = useState({});
  const [bounds, setBounds] = useState({});

  const scenarioSlice = getScenarioSlice(sid);
  const { setDrawing, setDrawingGeo } = scenarioSlice.actions;

  const dispatch = useDispatch();

  const { drawing, drawingGeo } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const mode = useMemo(() => {
    if (drawing === 'editing') return new EditingMode();
    if (drawing === 'polygon') return new DrawPolygonMode();

    return null;
  }, [drawing]);

  useEffect(() => {
    const EDITOR = editorRef?.current;

    if (!drawing && !!EDITOR) {
      EDITOR.deleteFeatures(drawingGeo);
      dispatch(setDrawingGeo(null));
    }

    return () => {
      if (!drawing && !!EDITOR) {
        EDITOR.deleteFeatures(drawingGeo);
        dispatch(setDrawingGeo(null));
      }
    };
  }, [drawing, drawingGeo, dispatch, setDrawingGeo]);

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

  return (
    <div className="relative w-full h-full overflow-hidden rounded-4xl">
      <button
        type="button"
        onClick={() => {

        }}
      >
        Editting
      </button>
      <Map
        // bounds={bounds}
        width="100%"
        height="100%"
        minZoom={minZoom}
        maxZoom={maxZoom}
        viewport={viewport}
        mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN}
        mapStyle="mapbox://styles/marxan/ckn4fr7d71qg817kgd9vuom4s"
        onMapViewportChange={handleViewportChange}
      >
        {(map) => {
          return (
            <>
              <LayerManager map={map} plugin={PluginMapboxGl}>
                {LAYERS.map((l) => (
                  <Layer key={l.id} {...l} />
                ))}
              </LayerManager>

              <Editor
                ref={editorRef}
                clickRadius={12}
                mode={mode}
                features={drawingGeo}
                onUpdate={(s) => {
                  const { data, editType } = s;
                  const EDITION_TYPES = ['addFeature'];
                  const UPDATE_TYPES = ['addFeature', 'addPosition', 'movePosition'];

                  if (EDITION_TYPES.includes(editType)) {
                    dispatch(setDrawing('editing'));
                    dispatch(setDrawingGeo(data));
                  }

                  if (UPDATE_TYPES.includes(editType)) {
                    dispatch(setDrawingGeo(data));
                  }
                }}
              />
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
