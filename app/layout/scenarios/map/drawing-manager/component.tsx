import React, {
  useEffect, useMemo, useRef,
} from 'react';

import {
  Editor,
  EditingMode,
  DrawPolygonMode,
} from 'react-map-gl-draw';
import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { featureStyle, editHandleStyle } from './drawing-styles';

export interface ScenariosDrawingManagerProps {
}

export const ScenariosDrawingManager: React.FC<ScenariosDrawingManagerProps> = () => {
  const { query } = useRouter();
  const { sid } = query;
  const editorRef = useRef(null);

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setDrawing, setDrawingValue, setUploadingValue } = scenarioSlice.actions;

  const dispatch = useDispatch();

  const {
    drawing, uploading, drawingValue, uploadingValue,
  } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const mode = useMemo(() => {
    if (drawing === 'editing') return new EditingMode();
    if (drawing === 'polygon') return new DrawPolygonMode();

    return null;
  }, [drawing]);

  useEffect(() => {
    const EDITOR = editorRef?.current;

    if ((!drawing && !uploading) && !!EDITOR) {
      EDITOR.deleteFeatures(drawingValue || uploadingValue);
      dispatch(setDrawingValue(null));
      dispatch(setUploadingValue(null));
    }
  }, [
    drawing,
    uploading,
    drawingValue,
    uploadingValue,
    dispatch,
    setDrawingValue,
    setUploadingValue,
  ]);

  // Delete feature as soon as you unmount this component
  useEffect(() => {
    const EDITOR = editorRef?.current;

    return () => {
      if (EDITOR) {
        EDITOR.deleteFeatures(drawingValue || uploadingValue);
        dispatch(setDrawingValue(null));
      }
    };
  }, []); // eslint-disable-line

  return (
    <Editor
      ref={editorRef}
      clickRadius={12}
      mode={mode}
      features={drawingValue || uploadingValue}
      featureStyle={featureStyle}
      editHandleStyle={editHandleStyle}
      editHandleShape="circle"
      onUpdate={(s) => {
        const { data, editType } = s;
        const EDITION_TYPES = ['addFeature'];
        const UPDATE_TYPES = ['addFeature', 'addPosition', 'movePosition'];

        if (EDITION_TYPES.includes(editType)) {
          dispatch(setDrawing('editing'));
          dispatch(setDrawingValue(data));
        }

        if (UPDATE_TYPES.includes(editType)) {
          dispatch(setDrawingValue(data));
        }
      }}
    />
  );
};

export default ScenariosDrawingManager;
