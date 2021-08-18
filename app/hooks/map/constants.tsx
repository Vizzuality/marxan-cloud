import React from 'react';

import Icon from 'components/icon';

import HEXAGON_SVG from 'svgs/map/hexagon.svg?sprite';
import SQUARE_SVG from 'svgs/map/square.svg?sprite';

export const COLORS = {
  primary: '#00BFFF',
  species: {
    default: '#FFCC00',
    hover: '#FF9900',
  },
  bioregional: {
    default: '#03E7D1',
    hover: '#03FDD1',
  },
  wdpa: '#00F',
  features: '#6F53F7',
  include: '#0F0',
  exclude: '#F00',
  cost: [
    '#FFBFB7',
    '#C21701',
  ],
  frequency: [
    '#0C2C32',
    '#006D83',
    '#008B8C',
    '#0BC6C2',
  ],
};

export const LEGEND_LAYERS = {
  pugrid: () => ({
    id: 'pugrid',
    name: 'PU grid',
    icon: <Icon icon={HEXAGON_SVG} className="w-3.5 h-3.5 mt-0.5 stroke-current stroke-2 fill-none" style={{ color: COLORS.primary }} />,
    opacityManager: true,
  }),

  // WDPA
  'wdpa-preview': () => ({
    id: 'wdpa-preview',
    name: 'Protected areas preview',
    icon: <Icon icon={SQUARE_SVG} className="w-3.5 h-3.5 mt-0.5 stroke-current stroke-2" style={{ color: COLORS.wdpa }} />,
    opacityManager: true,
  }),
  'wdpa-percentage': () => ({
    id: 'wdpa-percentage',
    name: 'Protected areas percentage',
    icon: <Icon icon={HEXAGON_SVG} className="w-3.5 h-3.5 mt-0.5 stroke-current stroke-2" style={{ color: COLORS.wdpa }} />,
    opacityManager: true,
  }),

  // Species
  bioregional: () => ({
    id: 'bioregional',
    name: 'Bioregional',
    icon: <Icon icon={SQUARE_SVG} className="w-3.5 h-3.5 mt-0.5 stroke-current stroke-2" style={{ color: COLORS.bioregional.default }} />,
    opacityManager: true,
  }),
  species: () => ({
    id: 'species',
    name: 'Species',
    icon: <Icon icon={SQUARE_SVG} className="w-3.5 h-3.5 mt-0.5 stroke-current stroke-2" style={{ color: COLORS.species.default }} />,
    opacityManager: true,
  }),
  features: () => ({
    id: 'features',
    name: 'Features',
    icon: <Icon icon={HEXAGON_SVG} className="w-3.5 h-3.5 mt-0.5 stroke-current stroke-2" style={{ color: COLORS.features }} />,
    opacityManager: true,
  }),

  // ANALYSIS
  cost: () => ({
    id: 'cost',
    name: 'Cost surface',
    type: 'gradient',
    opacityManager: true,
    items: [
      {
        color: COLORS.cost[0],
        value: '0',
      }, {
        color: COLORS.cost[1],
        value: '100',
      },
    ],
  }),
  'lock-in': (options) => {
    const { puIncludedValue } = options;

    return ({
      id: 'lock-in',
      name: 'Included areas',
      icon: <Icon icon={HEXAGON_SVG} className="w-3.5 h-3.5 mt-0.5 stroke-current stroke-2 fill-none" style={{ color: COLORS.include }} />,
      description: (
        <div className="pl-5">
          {puIncludedValue.length}
          {' '}
          PU
        </div>
      ),
    });
  },
  'lock-out': (options) => {
    const { puExcludedValue } = options;

    return ({
      id: 'lock-out',
      name: 'Excluded areas',
      icon: <Icon icon={HEXAGON_SVG} className="w-3.5 h-3.5 mt-0.5 stroke-current stroke-2 fill-none" style={{ color: COLORS.exclude }} />,
      description: (
        <div className="pl-5">
          {puExcludedValue.length}
          {' '}
          PU
        </div>
      ),
    });
  },

  // SOLUTIONS
  frequency: () => ({
    id: 'frequency',
    name: 'Frequency',
    type: 'gradient',
    opacityManager: true,
    items: [
      {
        color: COLORS.frequency[0],
        value: '0',
      },
      {
        color: COLORS.frequency[1],
        value: null,
      },
      {
        color: COLORS.frequency[2],
        value: null,
      },
      {
        color: COLORS.frequency[3],
        value: '100',
      },
    ],
  }),
  solution: () => ({
    id: 'solution',
    name: 'Solution selected',
    icon: <Icon icon={HEXAGON_SVG} className="w-3.5 h-3.5 mt-0.5 stroke-current stroke-2" style={{ color: COLORS.primary }} />,
    opacityManager: true,
  }),
};
