import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { injectReducer } from 'store';

interface ScenarioShowStateProps {
  tab: string,
  subtab: string,
  selectedSolutionId: string;
}

const initialState = {
  tab: 'solutions',
  subtab: null,
  selectedSolutionId: null,
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
      setSelectedSolution: (state, action: PayloadAction<string>) => {
        state.selectedSolutionId = action.payload;
      },
    },
  });

  injectReducer(`/scenarios/${id}`, scenariosDetailSlice.reducer);

  return scenariosDetailSlice;
}
