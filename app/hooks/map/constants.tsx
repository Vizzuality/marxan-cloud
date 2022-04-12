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
  compare: {
    '#1F1F1F': ['00'],
    '#0F0559': ['01', '10', '11'],
    '#3278B3': [
      '02', '03', '04', '05',
      '12', '13', '14', '15',
    ],
    '#1C9BD0': [
      '06', '07', '08', '09', '010',
      '16', '17', '18', '19', '110',
    ],
    '#B41792': [
      '20', '30', '40', '50',
      '21', '31', '41', '51',
    ],
    '#DE3397': [
      '60', '70', '80', '90', '100',
      '61', '71', '81', '91', '101',
    ],
    '#AFAAD3': [
      '22', '23', '24', '25',
      '32', '33', '34', '35',
      '42', '43', '44', '45',
      '52', '53', '54', '55',
    ],
    '#89CCE8': [
      '26', '27', '28', '29', '210',
      '36', '37', '38', '39', '310',
      '46', '47', '48', '49', '410',
      '56', '57', '58', '59', '510',
    ],
    '#E1ABD4': [
      '62', '63', '64', '65',
      '72', '73', '74', '75',
      '82', '83', '84', '85',
      '92', '93', '94', '95',
      '102', '103', '104', '105',
    ],
    '#E5E2F0': [
      '66', '67', '68', '69', '610',
      '76', '77', '78', '79', '710',
      '86', '87', '88', '89', '810',
      '96', '97', '98',
      '106', '107', '108',
    ],
    '#FFF': [
      '99', '910',
      '109', '1010',
    ],
  },
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
  'features-highlight': () => ({
    id: 'features-highlight',
    name: 'Selected Features',
    icon: <Icon icon={HEXAGON_SVG} className="w-3.5 h-3.5 mt-0.5 stroke-current stroke-2" style={{ color: COLORS.highlightFeatures }} />,
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
    const COLOR_NUMBER = 10;
    const colors = [...Array((COLOR_NUMBER + 1) * (COLOR_NUMBER + 1)).keys()];

    const ramp = colors
      .map((c, i) => {
        const position = `${Math.floor((i / (COLOR_NUMBER + 1)) % (COLOR_NUMBER + 1))}${i % (COLOR_NUMBER + 1)}`;
        const color = Object.keys(COLORS.compare)
          .reduce((acc, k) => {
            if (COLORS.compare[k].includes(position) && !acc) {
              return k;
            }

            return acc;
          }, '');

        return color;
      })
      .flat();

    return ({
      id: 'compare',
      name: 'Solutions distribution',
      type: 'matrix',
      settingsManager: {
        opacity: true,
        visibility: true,
      },
      intersections: ramp.map((c, i) => ({ id: i, color: c })).reverse(),
      items: [
        {
          value: `${scenario1?.name}`,
          color: '#DE3397',
        },
        {
          value: scenario2?.name,
          color: '#1C9BD0',
        },
      ],
    });
  },
};
