import { combineReducers, configureStore } from '@reduxjs/toolkit';

import projects from 'store/slices/projects';
import projectsDetail from 'store/slices/projects/[id]';
import projectsNew from 'store/slices/projects/new';
import communityProjects from 'store/slices/community/projects';
// import scenariosEdit from 'store/slices/scenarios/edit';

// Reducers
const staticReducers = {
  '/projects': projects,
  '/projects/[id]': projectsDetail,
  '/projects/new': projectsNew,
  '/community/projects': communityProjects,
};

const asyncReducers = {};

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
