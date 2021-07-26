import { injectReducer } from 'store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ScenarioEditStateProps {
  tab: string,

  // WDPA
  wdpaCategories: Record<string, any>;

  // PROTECTED AREAS
  uploadingProtectedArea: Record<string, object>
  uploadingProtectedAreaFileNames: string[];

  // ADJUST PLANNING UNITS
  clicking: boolean;
  clickingValue: string[];

  drawing: string;
  drawingValue: Record<string, object>;

  uploading: boolean;
  uploadingValue: Record<string, object>
}

const initialState = {
  tab: 'protected-areas',

  // WDPA
  wdpaCategories: {},

  // PROTECTED AREAS
  uploadingProtectedArea: null,
  uploadingProtectedAreaFileNames: [],

  // ADJUST PLANNING UNITS
  clicking: false,
  clickingValue: [],
  drawing: null,
  drawingValue: null,
  uploading: false,
  uploadingValue: null,
} as ScenarioEditStateProps;

export function getScenarioSlice(id) {
  const scenariosEditSlice = createSlice({
    name: `/scenarios/${id}/edit`,
    initialState,
    reducers: {
      setTab: (state, action: PayloadAction<string>) => {
        state.tab = action.payload;
      },

      // WDPA
      setWDPACategories: (state, action: PayloadAction<Record<string, object>>) => {
        state.wdpaCategories = action.payload;
      },

      // PROTECTED AREAS
      setUploadingProtectedArea: (state, action: PayloadAction<Record<string, object>>) => {
        state.uploadingProtectedArea = action.payload;
      },

      setUploadingProtectedAreaFileNames: (
        state, action: PayloadAction<string[]>,
      ) => {
        state.uploadingProtectedAreaFileNames = action.payload;
      },

      // ADJUST PLANNING UNITS
      setClicking: (state, action: PayloadAction<boolean>) => {
        state.clicking = action.payload;
      },
      setClickingValue: (state, action: PayloadAction<string[]>) => {
        state.clickingValue = action.payload;
      },
      setDrawing: (state, action: PayloadAction<string>) => {
        state.drawing = action.payload;
      },
      setDrawingValue: (state, action: PayloadAction<Record<string, object>>) => {
        state.drawingValue = action.payload;
      },
      setUploading: (state, action: PayloadAction<boolean>) => {
        state.uploading = action.payload;
      },
      setUploadingValue: (state, action: PayloadAction<Record<string, object>>) => {
        state.uploadingValue = action.payload;
      },
    },
  });

  injectReducer(`/scenarios/${id}/edit`, scenariosEditSlice.reducer);

  return scenariosEditSlice;
}
