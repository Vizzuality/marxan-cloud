import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Project } from 'types/api/project';

interface ProjectShowStateProps {
  bbox: [number, number, number, number];
  minPuAreaSize: number;
  maxPuAreaSize: number;
  uploadingPlanningArea: Record<string, object>;
  uploadingPlanningAreaId: string;
  uploadingGridId: string;
  uploadMode: string;
  legacyProjectId: Project['id'];
}

const initialState: ProjectShowStateProps = {
  bbox: null,
  minPuAreaSize: 0,
  maxPuAreaSize: 100,
  uploadingPlanningArea: null,
  uploadingPlanningAreaId: null,
  uploadingGridId: null,
  uploadMode: null,
  legacyProjectId: null,
} satisfies ProjectShowStateProps;

const projectsNewSlice = createSlice({
  name: '/projects/new',
  initialState,
  reducers: {
    setBbox: (state, action: PayloadAction<ProjectShowStateProps['bbox']>) => {
      return {
        ...state,
        bbox: action.payload,
      };
    },
    setMinPuAreaSize: (state, action: PayloadAction<ProjectShowStateProps['minPuAreaSize']>) => {
      state.minPuAreaSize = action.payload;
    },
    setMaxPuAreaSize: (state, action: PayloadAction<ProjectShowStateProps['maxPuAreaSize']>) => {
      state.maxPuAreaSize = action.payload;
    },
    setUploadingPlanningArea: (
      state,
      action: PayloadAction<ProjectShowStateProps['uploadingPlanningArea']>
    ) => {
      state.uploadingPlanningArea = action.payload;
    },
    setUploadingPlanningAreaId: (
      state,
      action: PayloadAction<ProjectShowStateProps['uploadingPlanningAreaId']>
    ) => {
      state.uploadingPlanningAreaId = action.payload;
    },
    setUploadingGridId: (
      state,
      action: PayloadAction<ProjectShowStateProps['uploadingGridId']>
    ) => {
      state.uploadingGridId = action.payload;
    },
    setUploadMode: (state, action: PayloadAction<ProjectShowStateProps['uploadMode']>) => {
      state.uploadMode = action.payload;
    },
    setLegacyProjectId: (
      state,
      action: PayloadAction<ProjectShowStateProps['legacyProjectId']>
    ) => {
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
