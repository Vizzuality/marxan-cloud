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
  highlightFeatures: '#FFFFFF',
  features2: ['#B3A5FB', '#6F53F7'],
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
  compare: [
    ['#2A511E', '#586527', '#8B7931', '#BD8D3B'],
    ['#30603F', '#5E774D', '#918E5C', '#C5A66B'],
    ['#366E5F', '#648975', '#97A38A', '#CCBDA0'],
    ['#3C7B7E', '#6A9A9B', '#9EB6B8', '#DDDDDD'],
  ],
};

export const LEGEND_LAYERS = {
  pugrid: () => ({
    id: 'pugrid',
    name: 'Planning unit grid',
    icon: <Icon icon={HEXAGON_SVG} className="w-3.5 h-3.5 mt-0.5 stroke-current stroke-2 fill-none" style={{ color: COLORS.primary }} />,
    settingsManager: {
      opacity: true,
      visibility: true,
    },
  }),

  // WDPA
  'wdpa-preview': () => ({
    id: 'wdpa-preview',
    name: 'Protected areas preview',
    icon: <Icon icon={SQUARE_SVG} className="w-3.5 h-3.5 mt-0.5 stroke-current stroke-2" style={{ color: COLORS.wdpa }} />,
    settingsManager: {
      opacity: true,
      visibility: true,
    },
  }),
  'wdpa-percentage': () => ({
    id: 'wdpa-percentage',
    name: 'Protected areas',
    icon: <Icon icon={HEXAGON_SVG} className="w-3.5 h-3.5 mt-0.5 stroke-current stroke-2" style={{ color: COLORS.wdpa }} />,
    settingsManager: {
      opacity: true,
      visibility: true,
    },
  }),

  // Species
  bioregional: () => ({
    id: 'bioregional',
    name: 'Bioregion',
    icon: <Icon icon={SQUARE_SVG} className="w-3.5 h-3.5 mt-0.5 stroke-current stroke-2" style={{ color: COLORS.bioregional.default }} />,
    settingsManager: {
      opacity: true,
      visibility: true,
    },
  }),
  species: () => ({
    id: 'species',
    name: 'Species',
    icon: <Icon icon={SQUARE_SVG} className="w-3.5 h-3.5 mt-0.5 stroke-current stroke-2" style={{ color: COLORS.species.default }} />,
    settingsManager: {
      opacity: true,
      visibility: true,
    },
  }),
  features: (options) => {
    const { features } = options;
    return ({
      id: 'features',
      name: 'Features',
      type: 'gradient',
      settingsManager: {
        opacity: true,
        visibility: true,
      },
      items: [
        {
          color: COLORS.features2[0],
          value: '1',
        }, {
          color: COLORS.features2[1],
          value: `${features.length}`,
        },
      ],
    });
  },

  // ANALYSIS
  cost: (options) => {
    const {
      cost = {
        min: 0,
        max: 1,
      },
    } = options;

    return {
      id: 'cost',
      name: 'Cost surface',
      type: 'gradient',
      settingsManager: {
        opacity: true,
        visibility: true,
      },
      items: [
        {
          color: COLORS.cost[0],
          value: `${cost.min === cost.max ? 0 : cost.min}`,
        }, {
          color: COLORS.cost[1],
          value: `${cost.max}`,
        },
      ],
    };
  },
  'lock-in': (options) => {
    const { puIncludedValue } = options;

    return ({
      id: 'lock-in',
      name: 'Included areas',
      icon: <Icon icon={HEXAGON_SVG} className="w-3.5 h-3.5 mt-0.5 stroke-current stroke-2 fill-none" style={{ color: COLORS.include }} />,
      settingsManager: {
        opacity: true,
        visibility: true,
      },
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
      settingsManager: {
        opacity: true,
        visibility: true,
      },
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
    settingsManager: {
      opacity: true,
      visibility: true,
    },
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
    settingsManager: {
      opacity: true,
      visibility: true,
    },
  }),
  compare: () => ({
    id: 'compare',
    name: 'Solutions distribution',
    type: 'matrix',
    settingsManager: {
      opacity: true,
      visibility: true,
    },
    intersections: [].concat(...COLORS.compare).map((c, i) => ({ id: i, color: c })).reverse(),
    items: [
      {
        value: 'Scenario 2',
        color: '#3C7B7E',
      },
      {
        value: 'Scenario 3',
        color: '#DA9827',
      },
    ],
  }),
};
