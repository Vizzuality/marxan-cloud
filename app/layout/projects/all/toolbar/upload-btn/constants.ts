import DEFAULT_UPLOAD_SVG from 'svgs/scenario-types/marxan-with-zones.svg?sprite';
import LEGACY_UPLOAD_SVG from 'svgs/scenario-types/marxan.svg?sprite';

export const UPLOAD_PROJECT_TYPES = [
  {
    id: 'default',
    icon: DEFAULT_UPLOAD_SVG,
    iconStyles: {
      width: 32,
      height: 20,
    },
    title: 'Upload project',
    subtitle: 'Use this option to upload a project created within this application',
    disclaimer: '',
    disabled: false,
  },
  {
    id: 'legacy',
    icon: LEGACY_UPLOAD_SVG,
    iconStyles: {
      width: 42,
      height: 20,
    },
    title: 'Upload legacy project',
    subtitle: 'Use this option to upload projects created with different Marxan application',
    disclaimer: '',
    disabled: false,
  },
];
