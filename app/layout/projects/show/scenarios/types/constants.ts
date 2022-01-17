import SCENARIO_MARXAN_WITH_CONNECTIVITY_SVG from 'svgs/scenario-types/marxan-with-connectivity.svg?sprite';
import SCENARIO_MARXAN_WITH_ZONES_SVG from 'svgs/scenario-types/marxan-with-zones.svg?sprite';
import SCENARIO_MARXAN_SVG from 'svgs/scenario-types/marxan.svg?sprite';

export const SCENARIO_TYPES = [
  {
    id: 'marxan',
    href: '/scenarios/new',
    title: 'Marxan',
    icon: SCENARIO_MARXAN_SVG,
    iconStyles: {
      width: 32,
      height: 20,
    },
    subtitle: 'Prioritizes for a single action (e.g. a protected area network)',
    disclaimer: 'If just starting out, we recommend Marxan to help you familiarize yourself with the process.',
  },
  {
    id: 'marxan-with-zones',
    href: '/scenarios/new',
    title: 'Marxan with Zones',
    icon: SCENARIO_MARXAN_WITH_ZONES_SVG,
    iconStyles: {
      width: 42,
      height: 20,
    },
    subtitle: 'Prioritizes for multiple actions simultaneously (e.g. protected areas, community-use, and sustainable use zones).',
    disclaimer: 'This approach is more data and process intensive.',
    disabled: true,
  },
  {
    id: 'marxan-with-connectivity',
    href: '/scenarios/new',
    title: 'Marxan with Connectivity',
    icon: SCENARIO_MARXAN_WITH_CONNECTIVITY_SVG,
    iconStyles: {
      width: 42,
      height: 20,
    },
    subtitle: 'Prioritizes for one action at a time while accounting for ecological processes and flows.',
    disabled: true,
  },
];
