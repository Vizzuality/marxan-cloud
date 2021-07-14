import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProjectShowStateProps {
  bbox: number[];
  minPuAreaSize: number;
  maxPuAreaSize: number;
  planningAreaId: number;
  uploading: boolean;
  uploadingValue: Record<string, object>
}

const initialState = {
  bbox: null,
  minPuAreaSize: 0,
  maxPuAreaSize: 100,
  planningAreaId: null,
  uploading: false,
  uploadingValue: null,
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
    setUploading: (state, action: PayloadAction<boolean>) => {
      state.uploading = action.payload;
    },
    setUploadingValue: (state, action: PayloadAction<Record<string, object>>) => {
      state.uploadingValue = action.payload;
    },
    setPlanningAreaId: (state, action: PayloadAction<number>) => {
      state.planningAreaId = action.payload;
    },
  },
});

export const {
  setBbox, setMinPuAreaSize, setMaxPuAreaSize, setUploading, setUploadingValue, setPlanningAreaId,
} = projectsNewSlice.actions;
export default projectsNewSlice.reducer;
