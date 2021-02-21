import { configureStore } from '@reduxjs/toolkit';

import projects from 'store/slices/projects';

// ...
const store = configureStore({
  reducer: {
    '/projects': projects,
    // '/projects[id]': projectsDetail,
    // '/projects[new]': projectsNew,
    // '/projects[edit]': projectsEdit,
  },
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export default store;
