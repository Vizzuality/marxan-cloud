import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProjectShowStateProps {
  bbox: number[];
  minPuAreaSize: number;
  maxPuAreaSize: number;
  uploadingPlanningArea: Record<string, object>;
  uploadingPlanningAreaId: string;
  uploadingGridId: string;
  uploadMode: string;
  legacyProjectId: string;
}

const initialState = {
  bbox: null,
  minPuAreaSize: 0,
  maxPuAreaSize: 100,
  uploadingPlanningArea: null,
  uploadingPlanningAreaId: null,
  uploadingGridId: null,
  uploadMode: null,
  legacyProjectId: null,
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
    setUploadingPlanningAreaId: (state, action: PayloadAction<string>) => {
      state.uploadingPlanningAreaId = action.payload;
    },
    setUploadingGridId: (state, action: PayloadAction<string>) => {
      state.uploadingGridId = action.payload;
    },
    setUploadMode: (state, action: PayloadAction<string>) => {
      state.uploadMode = action.payload;
    },
    setLegacyProjectId: (state, action: PayloadAction<string>) => {
      state.legacyProjectId = action.payload;
    },
  },
});

export const {
  setBbox,
  setMinPuAreaSize,
  setMaxPuAreaSize,
  setUploadingPlanningArea,
  setUploadingPlanningAreaId,
  setUploadingGridId,
  setUploadMode,
  setLegacyProjectId,
} = projectsNewSlice.actions;
export default projectsNewSlice.reducer;
