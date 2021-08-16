import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { injectReducer } from 'store';
import { Solution } from 'types/project-model';

interface ScenarioShowStateProps {
  tab: string,
  subtab: string,
  selectedSolution: Solution;
}

const initialState = {
  tab: 'solutions',
  subtab: null,
  selectedSolution: null,
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
    },
  });

  injectReducer(`/scenarios/${id}`, scenariosDetailSlice.reducer);

  return scenariosDetailSlice;
}
