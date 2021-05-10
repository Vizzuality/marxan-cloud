import { injectReducer } from 'store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ScenarioEditStateProps {
  tab: string,
  drawing: string;
  drawingGeo: Record<string, object>
}

const initialState = {
  tab: 'protected-areas',
  drawing: null,
  drawingGeo: null,
} as ScenarioEditStateProps;

export function getScenarioSlice(id) {
  const scenariosEditSlice = createSlice({
    name: `/scenarios/${id}/edit`,
    initialState,
    reducers: {
      setTab: (state, action: PayloadAction<string>) => {
        state.tab = action.payload;
      },
      setDrawing: (state, action: PayloadAction<string>) => {
        state.drawing = action.payload;
      },
      setDrawingGeo: (state, action: PayloadAction<Record<string, object>>) => {
        state.drawingGeo = action.payload;
      },
    },
  });

  injectReducer(`/scenarios/${id}/edit`, scenariosEditSlice.reducer);

  return scenariosEditSlice;
}
