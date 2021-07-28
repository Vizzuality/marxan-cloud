import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SolutionsDetailsStateProps {
  selectedSolutionId: string;
}

const initialState = {
  selectedSolutionId: null,
} as SolutionsDetailsStateProps;

const solutionsDetailsSlice = createSlice({
  name: '/solutions/details',
  initialState,
  reducers: {
    setSelectedSolution: (state, action: PayloadAction<string>) => {
      state.selectedSolutionId = action.payload;
    },
  },
});

export const { setSelectedSolution } = solutionsDetailsSlice.actions;
export default solutionsDetailsSlice.reducer;
