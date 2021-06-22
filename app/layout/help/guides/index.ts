import PROJECTS_GUIDE from './projects';
import PROJECTS_NEW_GUIDE from './projects/new';
import PROJECTS_ID_GUIDE from './projects/[id]';

export default {
  '/projects': PROJECTS_GUIDE,
  '/projects/new': PROJECTS_NEW_GUIDE,
  '/projects/[id]': PROJECTS_ID_GUIDE,
};
