import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProjectShowStateProps {
  bbox: number[]
}

const initialState = { bbox: null } as ProjectShowStateProps;

const projectsNewSlice = createSlice({
  name: '/projects/new',
  initialState,
  reducers: {
    setBbox: (state, action: PayloadAction<number[]>) => {
      state.bbox = action.payload;
    },
  },
});

export const { setBbox } = projectsNewSlice.actions;
export default projectsNewSlice.reducer;
