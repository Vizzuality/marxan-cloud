import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ReportsSolutionsStateProps {
  maps: Record<string, boolean>
}

const initialState = {
  maps: {
    'blm-map-1': false,
  },
} as ReportsSolutionsStateProps;

const reportsBlmSlice = createSlice({
  name: '/reports/blm',
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

export const { setMaps } = reportsBlmSlice.actions;
export default reportsBlmSlice.reducer;
