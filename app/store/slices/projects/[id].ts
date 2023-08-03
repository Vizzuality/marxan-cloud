import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProjectShowStateProps {
  search: string;
  filters: Record<string, unknown> | [];
  sort: string;
  layerSettings: Record<string, any>;
  selectedFeatures: string[];
  isSidebarOpen: boolean;
}

const initialState: ProjectShowStateProps = {
  search: '',
  filters: {},
  sort: '-lastModifiedAt',
  layerSettings: {},
  selectedFeatures: [],
  isSidebarOpen: true,
} satisfies ProjectShowStateProps;

const projectsDetailSlice = createSlice({
  name: '/projects/[id]',
  initialState,
  reducers: {
    setSidebarVisibility: (
      state,
      action: PayloadAction<ProjectShowStateProps['isSidebarOpen']>
    ) => {
      state.isSidebarOpen = action.payload;
    },
    setSearch: (state, action: PayloadAction<ProjectShowStateProps['search']>) => {
      state.search = action.payload;
    },
    setFilters: (state, action: PayloadAction<ProjectShowStateProps['filters']>) => {
      state.filters = action.payload;
    },
    setSort: (state, action: PayloadAction<ProjectShowStateProps['sort']>) => {
      state.sort = action.payload;
    },
    // SETTINGS
    setLayerSettings: (
      state,
      action: PayloadAction<{
        id: string;
        settings: ProjectShowStateProps['layerSettings'];
      }>
    ) => {
      const { id: layerId, settings } = action.payload;
      const newSettings = {
        ...state.layerSettings,
        [layerId]: {
          ...state.layerSettings[layerId],
          ...settings,
        },
      };
      state.layerSettings = newSettings;
    },
    // FEATURES
    setSelectedFeatures: (
      state,
      action: PayloadAction<ProjectShowStateProps['selectedFeatures']>
    ) => {
      state.selectedFeatures = action.payload;
    },
  },
});

export const {
  setSearch,
  setFilters,
  setSort,
  setLayerSettings,
  setSelectedFeatures,
  setSidebarVisibility,
} = projectsDetailSlice.actions;

export default projectsDetailSlice.reducer;
