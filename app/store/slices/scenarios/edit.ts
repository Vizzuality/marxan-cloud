import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { injectReducer } from 'store';

interface ScenarioEditStateProps {
  tab: string,

  // WDPA
  wdpaCategories: Record<string, any>;

  // ADJUST PLANNING UNITS
  cache: number;
  puAction: string;
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

  // ADJUST PLANNING UNITS
  cache: Date.now(),
  puAction: 'include',
  clicking: false,
  clickingValue: [],
  drawing: null,
  drawingValue: null,
  uploading: false,
  uploadingValue: null,
} as ScenarioEditStateProps;

export function getScenarioEditSlice(id) {
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

      // ADJUST PLANNING UNITS
      setCache: (state, action: PayloadAction<number>) => {
        state.cache = action.payload;
      },
      setPUAction: (state, action: PayloadAction<string>) => {
        state.puAction = action.payload;
      },
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
