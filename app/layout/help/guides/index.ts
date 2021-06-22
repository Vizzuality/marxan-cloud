import PROJECTS_GUIDE from './projects';
import PROJECTS_NEW_GUIDE from './projects/new';
import PROJECTS_ID_GUIDE from './projects/[pid]';

export default {
  '/projects': PROJECTS_GUIDE,
  '/projects/new': PROJECTS_NEW_GUIDE,
  '/projects/[pid]': PROJECTS_ID_GUIDE,
};
