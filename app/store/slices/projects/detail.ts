import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProjectShowStateProps {
  search: string
}

const initialState = { search: '' } as ProjectShowStateProps;

const projectsSlice = createSlice({
  name: '/projects/[id]',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
  },
});

export const { setSearch } = projectsSlice.actions;
export default projectsSlice.reducer;
