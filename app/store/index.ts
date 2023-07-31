import communityProjects from 'store/slices/community/projects';
import projects from 'store/slices/projects';
import projectsDetail from 'store/slices/projects/[id]';
import projectsNew from 'store/slices/projects/new';
import reportsBlm from 'store/slices/reports/blm';
import reportsFrequency from 'store/slices/reports/frequency';
import reportsSolutions from 'store/slices/reports/solutions';

import { combineReducers, configureStore, Reducer } from '@reduxjs/toolkit';

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

// ? As of date, I have not found a way to type async reducers, so they are just not typed.
// ? Providing an empty object (with its Object type) was breaking the typing of the store for the static reducers,
// ? so they are now typed as unknown reducers so we can, at least, have types for the rest of the store.
const asyncReducers = {} as Reducer<unknown>;

const createReducer = (newReducers: typeof asyncReducers) =>
  combineReducers({
    ...staticReducers,
    ...newReducers,
  });

const store = configureStore({
  reducer: createReducer(asyncReducers),
  devTools: process.env.NODE_ENV !== 'production',
});

export function injectReducer(key: string, asyncReducer: typeof asyncReducers) {
  if (!asyncReducers[key]) {
    asyncReducers[key] = asyncReducer;
    store.replaceReducer(createReducer(asyncReducers));
  }
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
