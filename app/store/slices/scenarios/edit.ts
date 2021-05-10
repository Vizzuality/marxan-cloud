import { injectReducer } from 'store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ScenarioEditStateProps {
  tab: string,
  clicking: boolean;
  clickingValue: string[];

  drawing: string;
  drawingValue: Record<string, object>
}

const initialState = {
  tab: 'protected-areas',
  clicking: false,
  clickingValue: [],
  drawing: null,
  drawingValue: null,
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
      setDrawingValue: (state, action: PayloadAction<Record<string, object>>) => {
        state.drawingValue = action.payload;
      },
      setClicking: (state, action: PayloadAction<boolean>) => {
        state.clicking = action.payload;
      },
      setClickingValue: (state, action: PayloadAction<string[]>) => {
        state.clickingValue = action.payload;
      },
    },
  });

  injectReducer(`/scenarios/${id}/edit`, scenariosEditSlice.reducer);

  return scenariosEditSlice;
}
