import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProjectShowStateProps {
  bbox: number[];
  minPuAreaSize: number;
  maxPuAreaSize: number;
}

const initialState = {
  bbox: null,
  minPuAreaSize: 0,
  maxPuAreaSize: 100,
} as ProjectShowStateProps;

const projectsNewSlice = createSlice({
  name: '/projects/new',
  initialState,
  reducers: {
    setBbox: (state, action: PayloadAction<number[]>) => {
      state.bbox = action.payload;
    },
    setMinPuAreaSize: (state, action: PayloadAction<number>) => {
      state.minPuAreaSize = action.payload;
    },
    setMaxPuAreaSize: (state, action: PayloadAction<number>) => {
      state.maxPuAreaSize = action.payload;
    },
  },
});

export const { setBbox, setMinPuAreaSize, setMaxPuAreaSize } = projectsNewSlice.actions;
export default projectsNewSlice.reducer;
