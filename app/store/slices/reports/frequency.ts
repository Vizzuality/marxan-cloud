import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ReportsFrequencyStateProps {
  maps: Record<string, boolean>
}

const initialState = {
  maps: {
    'frequency-map-1': false,
  },
} as ReportsFrequencyStateProps;

const reportsFrequencySlice = createSlice({
  name: '/reports/frequency',
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

export const { setMaps } = reportsFrequencySlice.actions;
export default reportsFrequencySlice.reducer;
