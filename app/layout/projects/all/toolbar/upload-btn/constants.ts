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
    subtitle: 'Prioritizes for a single action (e.g. a protected area network)',
    disclaimer: 'If just starting out, we recommend Marxan to help you familiarize yourself with the process.',
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
    subtitle: 'Prioritizes for multiple actions simultaneously (e.g. protected areas, community-use, and sustainable use zones).',
    disclaimer: 'This approach is more data and process intensive.',
    disabled: false,
  },
];
