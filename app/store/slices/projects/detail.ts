import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProjectShowStateProps {
  search: string
}

const initialState = { search: '' } as ProjectShowStateProps;

const projectsDetailSlice = createSlice({
  name: '/projects/[id]',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
  },
});

export const { setSearch } = projectsDetailSlice.actions;
export default projectsDetailSlice.reducer;
