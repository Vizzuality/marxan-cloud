import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ReportsComparisonStateProps {
  maps: Record<string, boolean>;
}

const initialState = {
  maps: {
    'comparison-map-1': false,
  },
} as ReportsComparisonStateProps;

const reportsComparisonSlice = createSlice({
  name: '/reports/comparison',
  initialState,
  reducers: {
    setMaps: (state, action: PayloadAction<Record<string, boolean>>) => {
      state.maps = {
        ...state.maps,
        ...action.payload,
      };
    },
  },
});

export const { setMaps } = reportsComparisonSlice.actions;
export default reportsComparisonSlice.reducer;
