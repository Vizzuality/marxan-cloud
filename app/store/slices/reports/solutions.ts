import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ReportsSolutionsStateProps {
  maps: Record<string, boolean>
}

const initialState = {
  maps: {
    'report-map-1': false,
    'report-map-2': false,
  },
} as ReportsSolutionsStateProps;

const reportsSolutionsSlice = createSlice({
  name: '/reports/solutions',
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

export const { setMaps } = reportsSolutionsSlice.actions;
export default reportsSolutionsSlice.reducer;
