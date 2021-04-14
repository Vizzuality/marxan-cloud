import { injectReducer } from 'store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ScenarioEditStateProps {
  tab: string
}

const initialState = {
  tab: 'protected-areas',
} as ScenarioEditStateProps;

export function getScenarioSlice(id) {
  const scenariosEditSlice = createSlice({
    name: `/scenarios/${id}`,
    initialState,
    reducers: {
      setTab: (state, action: PayloadAction<string>) => {
        state.tab = action.payload;
      },
    },
  });

  injectReducer(`/scenarios/${id}`, scenariosEditSlice.reducer);

  return scenariosEditSlice;
}
