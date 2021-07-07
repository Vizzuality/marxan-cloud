import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CommunityProjectsStateProps {
  search: string
}

const initialState = { search: '' } as CommunityProjectsStateProps;

const communityProjectsSlice = createSlice({
  name: '/community/projects',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
  },
});

export const { setSearch } = communityProjectsSlice.actions;
export default communityProjectsSlice.reducer;
