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
  highlightFeatures: '#37297B',
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
  compare2: [
    '#1F1F1F',
    '#0F0559',
    '#B41792',
    '#B41792',
    '#B41792',
    '#B41792',
    '#DE3397',
    '#DE3397',
    '#DE3397',
    '#DE3397',
    '#DE3397',
    '#0F0559',
    '#0F0559',
    '#B41792',
    '#B41792',
    '#B41792',
    '#B41792',
    '#DE3397',
    '#DE3397',
    '#DE3397',
    '#DE3397',
    '#DE3397',
    '#3278B3',
    '#3278B3',
    '#AFAAD3',
    '#AFAAD3',
    '#AFAAD3',
    '#AFAAD3',
    '#E1ABD4',
    '#E1ABD4',
    '#E1ABD4',
    '#E1ABD4',
    '#E1ABD4',
    '#3278B3',
    '#3278B3',
    '#AFAAD3',
    '#AFAAD3',
    '#AFAAD3',
    '#AFAAD3',
    '#E1ABD4',
    '#E1ABD4',
    '#E1ABD4',
    '#E1ABD4',
    '#E1ABD4',
    '#3278B3',
    '#3278B3',
    '#AFAAD3',
    '#AFAAD3',
    '#AFAAD3',
    '#AFAAD3',
    '#E1ABD4',
    '#E1ABD4',
    '#E1ABD4',
    '#E1ABD4',
    '#E1ABD4',
    '#3278B3',
    '#3278B3',
    '#AFAAD3',
    '#AFAAD3',
    '#AFAAD3',
    '#AFAAD3',
    '#E1ABD4',
    '#E1ABD4',
    '#E1ABD4',
    '#E1ABD4',
    '#E1ABD4',
    '#1C9BD0',
    '#1C9BD0',
    '#89CCE8',
    '#89CCE8',
    '#89CCE8',
    '#89CCE8',
    '#E5E2F0',
    '#E5E2F0',
    '#E5E2F0',
    '#E5E2F0',
    '#E5E2F0',
    '#1C9BD0',
    '#1C9BD0',
    '#89CCE8',
    '#89CCE8',
    '#89CCE8',
    '#89CCE8',
    '#E5E2F0',
    '#E5E2F0',
    '#E5E2F0',
    '#E5E2F0',
    '#E5E2F0',
    '#1C9BD0',
    '#1C9BD0',
    '#89CCE8',
    '#89CCE8',
    '#89CCE8',
    '#89CCE8',
    '#E5E2F0',
    '#E5E2F0',
    '#E5E2F0',
    '#E5E2F0',
    '#E5E2F0',
    '#1C9BD0',
    '#1C9BD0',
    '#89CCE8',
    '#89CCE8',
    '#89CCE8',
    '#89CCE8',
    '#E5E2F0',
    '#E5E2F0',
    '#E5E2F0',
    '#FFFFFF',
    '#FFFFFF',
    '#1C9BD0',
    '#1C9BD0',
    '#89CCE8',
    '#89CCE8',
    '#89CCE8',
    '#89CCE8',
    '#E5E2F0',
    '#E5E2F0',
    '#E5E2F0',
    '#FFFFFF',
    '#FFFFFF',
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
  features: () => ({
    id: 'features',
    name: 'Features',
    icon: <Icon icon={HEXAGON_SVG} className="w-3.5 h-3.5 mt-0.5 stroke-current stroke-2" style={{ color: COLORS.features }} />,
    settingsManager: {
      opacity: true,
      visibility: true,
    },
  }),

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
  compare: (options) => {
    const { scenario1, scenario2 } = options;

    return ({
      id: 'compare',
      name: 'Solutions distribution',
      type: 'matrix',
      settingsManager: {
        opacity: true,
        visibility: true,
      },
      intersections: COLORS.compare2.map((c, i) => ({ id: i, color: c })).reverse(),
      items: [
        {
          value: `${scenario1?.name}Hello in the darkness scripi in the night`,
          color: '#1C9BD0',
        },
        {
          value: scenario2?.name,
          color: '#DE3397',
        },
      ],
    });
  },
};
