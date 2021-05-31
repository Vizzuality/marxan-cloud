import { combineReducers, configureStore } from '@reduxjs/toolkit';

import projects from 'store/slices/projects';
import projectsShow from 'store/slices/projects/detail';
// import scenariosEdit from 'store/slices/scenarios/edit';

// Reducers
const staticReducers = {
  '/projects': projects,
  '/projects/[id]': projectsShow,
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
