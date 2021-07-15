import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProjectShowStateProps {
  bbox: number[];
  minPuAreaSize: number;
  maxPuAreaSize: number;
  uploadingPlanningArea: Record<string, object>
}

const initialState = {
  bbox: null,
  minPuAreaSize: 0,
  maxPuAreaSize: 100,
  uploadingPlanningArea: null,
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
    setUploadingPlanningArea: (state, action: PayloadAction<Record<string, object>>) => {
      state.uploadingPlanningArea = action.payload;
    },
  },
});

export const {
  setBbox, setMinPuAreaSize, setMaxPuAreaSize, setUploadingPlanningArea,
} = projectsNewSlice.actions;
export default projectsNewSlice.reducer;
