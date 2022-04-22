import communityProjects from 'store/slices/community/projects';
import projects from 'store/slices/projects';
import projectsDetail from 'store/slices/projects/[id]';
import projectsNew from 'store/slices/projects/new';
import reportsBlm from 'store/slices/reports/blm';
import reportsFrequency from 'store/slices/reports/frequency';
import reportsSolutions from 'store/slices/reports/solutions';

import { combineReducers, configureStore } from '@reduxjs/toolkit';

// Reducers
const staticReducers = {
  '/projects': projects,
  '/projects/[id]': projectsDetail,
  '/projects/new': projectsNew,
  '/community/projects': communityProjects,
  '/reports/solutions': reportsSolutions,
  '/reports/blm': reportsBlm,
  '/reports/frequency': reportsFrequency,
};

const asyncReducers = {
};

const createReducer = (newReducers) => combineReducers({
  ...staticReducers,
  ...newReducers,
});

const store = configureStore({
  reducer: createReducer(asyncReducers),
  devTools: process.env.NODE_ENV !== 'production',
});

export function injectReducer(key, asyncReducer) {
  if (!asyncReducers[key]) {
    asyncReducers[key] = asyncReducer;
    store.replaceReducer(createReducer(asyncReducers));
  }
}

export type RootState = ReturnType<typeof store.getState>;
export default store;
