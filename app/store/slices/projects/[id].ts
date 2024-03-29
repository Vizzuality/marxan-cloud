import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { CostSurface } from 'types/api/cost-surface';
import { Feature } from 'types/api/feature';
import { WDPA } from 'types/api/wdpa';

interface ProjectShowStateProps {
  search: string;
  filters: Record<string, unknown> | [];
  sort: string;
  layerSettings: Record<string, any>;
  selectedCostSurface: CostSurface['id'];
  selectedFeatures: Feature['id'][];
  selectedContinuousFeatures: Feature['id'][];
  selectedWDPAs: WDPA['id'][];
  isSidebarOpen: boolean;
}

const initialState: ProjectShowStateProps = {
  search: '',
  filters: {},
  sort: '-lastModifiedAt',
  layerSettings: {
    pugrid: {
      visibility: true,
      opacity: 1,
    },
  },
  selectedFeatures: [],
  selectedContinuousFeatures: [],
  selectedCostSurface: null,
  selectedWDPAs: [],
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
    setSelectedContinuousFeatures: (
      state,
      action: PayloadAction<ProjectShowStateProps['selectedContinuousFeatures']>
    ) => {
      state.selectedContinuousFeatures = action.payload;
    },
    // COST SURFACE
    setSelectedCostSurface: (
      state,
      action: PayloadAction<ProjectShowStateProps['selectedCostSurface']>
    ) => {
      state.selectedCostSurface = action.payload;
    },
    // WDPAs
    setSelectedWDPAs: (state, action: PayloadAction<ProjectShowStateProps['selectedWDPAs']>) => {
      state.selectedWDPAs = action.payload;
    },
  },
});

export const {
  setSearch,
  setFilters,
  setSort,
  setLayerSettings,
  setSelectedFeatures,
  setSelectedContinuousFeatures,
  setSelectedCostSurface,
  setSelectedWDPAs,
  setSidebarVisibility,
} = projectsDetailSlice.actions;

export default projectsDetailSlice.reducer;
