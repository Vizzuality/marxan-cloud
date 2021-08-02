import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { injectReducer } from 'store';

interface ScenarioShowStateProps {
  tab: string,
  selectedSolutionId: string;
}

const initialState = {
  tab: 'protected-areas',
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
      setSelectedSolution: (state, action: PayloadAction<string>) => {
        state.selectedSolutionId = action.payload;
      },
    },
  });

  injectReducer(`/scenarios/${id}`, scenariosDetailSlice.reducer);

  return scenariosDetailSlice;
}
