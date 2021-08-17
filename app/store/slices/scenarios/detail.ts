import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { injectReducer } from 'store';
import { Solution } from 'types/project-model';

interface ScenarioShowStateProps {
  tab: string,
  subtab: string,
  selectedSolution: Solution,
  protectedAreasPreviewOpacity: number,
  frequencyOpacity: number,
}

const initialState = {
  tab: 'solutions',
  subtab: null,
  selectedSolution: null,
  protectedAreasPreviewOpacity: null,
  frequencyOpacity: null,
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
      setProtectedAreasPreviewOpacity: (state, action: PayloadAction<number>) => {
        state.protectedAreasPreviewOpacity = action.payload;
      },
      setFrequencyOpacity: (state, action: PayloadAction<number>) => {
        state.frequencyOpacity = action.payload;
      },
    },
  });

  injectReducer(`/scenarios/${id}`, scenariosDetailSlice.reducer);

  return scenariosDetailSlice;
}
