import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProjectListStateProps {
  search: string;
}

const initialState = { search: '' } as ProjectListStateProps;

const projectsSlice = createSlice({
  name: '/projects',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
  },
});

export const { setSearch } = projectsSlice.actions;
export default projectsSlice.reducer;
