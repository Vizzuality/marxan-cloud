import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { injectReducer } from 'store';
import { Solution } from 'types/project-model';

interface ScenarioShowStateProps {
  tab: string,
  subtab: string,
  selectedSolution: Solution,
  // FEATURES
  highlightFeatures: string[],
  // SETTINGS
  layerSettings: Record<string, Record<string, unknown>>
}

const initialState = {
  tab: 'solutions',
  subtab: null,
  selectedSolution: null,
  // FEATURES
  highlightFeatures: [],
  // SETTINGS
  layerSettings: {},
} as ScenarioShowStateProps;

export function getScenarioSlice(id) {
  const scenariosDetailSlice = createSlice({
    name: `/scenarios/${id}`,
    initialState,
    reducers: {
      setTab: (state, action: PayloadAction<string>) => {
        state.tab = action.payload;
      },
      setSubTab: (state, action: PayloadAction<string>) => {
        state.subtab = action.payload;
      },
      setSelectedSolution: (state, action: PayloadAction<Solution>) => {
        state.selectedSolution = action.payload;
      },

      // FEATURES
      setHighlightFeatures: (state, action: PayloadAction<string[]>) => {
        state.highlightFeatures = action.payload;
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

  injectReducer(`/scenarios/${id}`, scenariosDetailSlice.reducer);

  return scenariosDetailSlice;
}
