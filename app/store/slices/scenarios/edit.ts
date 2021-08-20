import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { injectReducer } from 'store';

interface ScenarioEditStateProps {
  tab: string,
  subtab: string,

  // WDPA
  wdpaCategories: Record<string, any>;
  wdpaThreshold: number;
  uploadingProtectedArea: Record<string, object>

  // FEATURES
  featureHoverId: string;

  // ADJUST PLANNING UNITS
  cache: number;
  puAction: string;
  puIncludedValue: string[];
  puExcludedValue: string[];
  puTmpIncludedValue: string[];
  puTmpExcludedValue: string[];

  clicking: boolean;

  drawing: string;
  drawingValue: Record<string, object>;

  uploading: boolean;
  uploadingValue: Record<string, object>

  // SETTINGS
  layerSettings: Record<string, Record<string, unknown>>
}

const initialState = {
  tab: 'protected-areas',
  subtab: 'protected-areas-preview',

  // WDPA
  wdpaCategories: {},
  wdpaThreshold: 0.75,
  uploadingProtectedArea: null,

  // FEATURES
  featureHoverId: null,

  // ADJUST PLANNING UNITS
  cache: Date.now(),
  puAction: 'include',
  clicking: false,
  puIncludedValue: [],
  puExcludedValue: [],
  puTmpIncludedValue: [],
  puTmpExcludedValue: [],
  drawing: null,
  drawingValue: null,
  uploading: false,
  uploadingValue: null,

  // SETTINGS
  layerSettings: {},
} as ScenarioEditStateProps;

export function getScenarioEditSlice(id) {
  const scenariosEditSlice = createSlice({
    name: `/scenarios/${id}/edit`,
    initialState,
    reducers: {
      setTab: (state, action: PayloadAction<string>) => {
        state.tab = action.payload;
      },
      setSubTab: (state, action: PayloadAction<string>) => {
        state.subtab = action.payload;
      },

      // WDPA
      setWDPACategories: (state, action: PayloadAction<Record<string, object>>) => {
        state.wdpaCategories = action.payload;
      },
      setWDPAThreshold: (state, action: PayloadAction<number>) => {
        state.wdpaThreshold = action.payload;
      },
      setUploadingProtectedArea: (state, action: PayloadAction<Record<string, object>>) => {
        state.uploadingProtectedArea = action.payload;
      },

      // FEATURES
      setFeatureHoverId: (state, action: PayloadAction<string>) => {
        state.featureHoverId = action.payload;
      },

      // ADJUST PLANNING UNITS
      setCache: (state, action: PayloadAction<number>) => {
        state.cache = action.payload;
      },
      setPUAction: (state, action: PayloadAction<string>) => {
        state.puAction = action.payload;
      },
      setPuIncludedValue: (state, action: PayloadAction<string[]>) => {
        state.puIncludedValue = action.payload;
      },
      setPuExcludedValue: (state, action: PayloadAction<string[]>) => {
        state.puExcludedValue = action.payload;
      },
      setTmpPuIncludedValue: (state, action: PayloadAction<string[]>) => {
        state.puTmpIncludedValue = action.payload;
      },
      setTmpPuExcludedValue: (state, action: PayloadAction<string[]>) => {
        state.puTmpExcludedValue = action.payload;
      },
      setClicking: (state, action: PayloadAction<boolean>) => {
        state.clicking = action.payload;
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

      // SETTINGS
      setLayerSettings: (state, action: PayloadAction<{
        id: string,
        settings: Record<string, unknown>
      }>) => {
        const { id: layerId, settings } = action.payload;
        const newSettings = {
          ...state.layerSettings,
          [layerId]: {
            ...state.layerSettings[layerId],
            ...settings,
          },
        };
        state.layerSettings = newSettings;
      },
    },
  });

  injectReducer(`/scenarios/${id}/edit`, scenariosEditSlice.reducer);

  return scenariosEditSlice;
}
