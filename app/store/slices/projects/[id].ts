import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProjectShowStateProps {
  search: string,
  filters: Record<string, any>;
  sort: string;
}

const initialState = {
  search: '',
  filters: {},
  sort: '-lastModifiedAt',
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
  },
});

export const { setSearch, setFilters, setSort } = projectsDetailSlice.actions;
export default projectsDetailSlice.reducer;
