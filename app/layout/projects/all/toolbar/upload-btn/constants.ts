import UPLOAD_LEGACY_PROJECT_SVG from 'svgs/project/upload_legacy_project.svg?sprite';
import UPLOAD_PROJECT_SVG from 'svgs/project/upload_project.svg?sprite';

export const UPLOAD_PROJECT_TYPES = [
  {
    id: 'default',
    title: 'Upload project',
    icon: UPLOAD_PROJECT_SVG,
    iconStyles: {
      width: 32,
      height: 20,
    },
    subtitle: 'Use this option to upload a project created within this application',
    disclaimer: '',
    disabled: false,
  },
  {
    id: 'legacy',
    title: 'Upload legacy project',
    icon: UPLOAD_LEGACY_PROJECT_SVG,
    iconStyles: {
      width: 42,
      height: 20,
    },
    subtitle: 'Use this option to upload projects created with different Marxan applications',
    disclaimer: '',
    disabled: false,
  },
];
