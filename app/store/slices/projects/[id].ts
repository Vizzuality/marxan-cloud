import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProjectShowStateProps {
  search: string,
  filters: Record<string, any>;
  sort: string;
  layerSettings: Record<string, Record<string, unknown>>
}

const initialState = {
  search: '',
  filters: {},
  sort: '-lastModifiedAt',
  layerSettings: {},
} as ProjectShowStateProps;

const projectsDetailSlice = createSlice({
  name: '/projects/[id]',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    setFilters: (state, action: PayloadAction<Record<string, any>>) => {
      state.filters = action.payload;
    },
    setSort: (state, action: PayloadAction<string>) => {
      state.sort = action.payload;
    },
    // SETTINGS
    setLayerSettings: (state, action: PayloadAction<{
      id: string,
      settings: Record<string, unknown>
    }>) => {
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
  },
});

export const {
  setSearch, setFilters, setSort, setLayerSettings,
} = projectsDetailSlice.actions;
export default projectsDetailSlice.reducer;
