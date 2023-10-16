import React from 'react';

import chroma from 'chroma-js';
import { FaSquare } from 'react-icons/fa';

import Icon from 'components/icon';
import { LegendItemType } from 'components/map/legend/types';
import { CostSurface } from 'types/api/cost-surface';
import { Feature } from 'types/api/feature';
import { Scenario } from 'types/api/scenario';
import { WDPA } from 'types/api/wdpa';

import HEXAGON_SVG from 'svgs/map/hexagon.svg?sprite';
import SQUARE_SVG from 'svgs/map/square.svg?sprite';

import { UseLegend } from './types';

export const COLORS = {
  primary: '#01768F',
  wdpa: '#5156CB',
  'wdpa-preview': '#01768F',
  highlightFeatures: '#BE6BFF',
  features: {
    default: '#24242D',
    ramp: [
      '#66C379',
      '#3C8BC4',
      '#8B91EC',
      '#E98842',
      '#51A1B2',
      '#CFD897',
      '#BE6BFF',
      '#B0A6CC',
      '#71AADF',
      '#E896BE',
      '#C48259',
      '#E9AB42',
      '#B059B8',
    ],
  },
  include: '#66F39F',
  exclude: '#FF6847',
  available: '#F1B61E',
  cost: ['#292F4D', '#732669', '#DE7239', '#FAFCA8'],
  frequency: ['#292F4D', '#4D5784', '#99D693', '#FFFFC6'],
  solution: '#9FD1F7',
  compare: {
    '#1F1F1F': ['00'],
    '#0F0559': ['01', '10', '11'],
    '#3278B3': ['02', '03', '04', '05', '12', '13', '14', '15'],
    '#1C9BD0': ['06', '07', '08', '09', '010', '16', '17', '18', '19', '110'],
    '#B41792': ['20', '30', '40', '50', '21', '31', '41', '51'],
    '#DE3397': ['60', '70', '80', '90', '100', '61', '71', '81', '91', '101'],
    '#AFAAD3': [
      '22',
      '23',
      '24',
      '25',
      '32',
      '33',
      '34',
      '35',
      '42',
      '43',
      '44',
      '45',
      '52',
      '53',
      '54',
      '55',
    ],
    '#89CCE8': [
      '26',
      '27',
      '28',
      '29',
      '210',
      '36',
      '37',
      '38',
      '39',
      '310',
      '46',
      '47',
      '48',
      '49',
      '410',
      '56',
      '57',
      '58',
      '59',
      '510',
    ],
    '#E1ABD4': [
      '62',
      '63',
      '64',
      '65',
      '72',
      '73',
      '74',
      '75',
      '82',
      '83',
      '84',
      '85',
      '92',
      '93',
      '94',
      '95',
      '102',
      '103',
      '104',
      '105',
    ],
    '#E5E2F0': [
      '66',
      '67',
      '68',
      '69',
      '610',
      '76',
      '77',
      '78',
      '79',
      '710',
      '86',
      '87',
      '88',
      '89',
      '810',
      '96',
      '97',
      '98',
      '106',
      '107',
      '108',
    ],
    '#FFF': ['99', '910', '109', '1010'],
  },
  ['compare-legend']: ['#DE3397', '#1C9BD0'],
};

export const LEGEND_LAYERS = {
  pugrid: ({ onChangeVisibility }: { onChangeVisibility?: () => void }) => ({
    id: 'pugrid',
    name: 'Planning unit grid',
    icon: (
      <Icon
        icon={HEXAGON_SVG}
        className="mt-0.5 h-3.5 w-3.5 fill-none stroke-current stroke-2"
        style={{ color: COLORS.primary }}
      />
    ),
    settingsManager: {
      opacity: true,
      visibility: true,
    },
    ...(onChangeVisibility && { onChangeVisibility }),
  }),

  // WDPA
  'wdpa-preview': (options: { onChangeVisibility: () => void }) => {
    const { onChangeVisibility } = options;

    return {
      id: 'wdpa-preview',
      name: 'Protected areas preview',
      icon: (
        <Icon
          icon={SQUARE_SVG}
          className="mt-0.5 h-3.5 w-3.5 stroke-current stroke-2"
          style={{ color: COLORS['wdpa-preview'] }}
        />
      ),
      settingsManager: {
        opacity: true,
        visibility: true,
      },
      onChangeVisibility,
    };
  },
  'wdpa-percentage': (options: { onChangeVisibility: () => void }) => {
    const { onChangeVisibility } = options;

    return {
      id: 'wdpa-percentage',
      name: 'Protected areas',
      icon: (
        <Icon
          icon={HEXAGON_SVG}
          className="mt-0.5 h-3.5 w-3.5 stroke-current stroke-2"
          style={{ color: COLORS.wdpa }}
        />
      ),
      settingsManager: {
        opacity: true,
        visibility: true,
      },
      onChangeVisibility,
    };
  },
  'designated-areas': (options: {
    items: { id: WDPA['id']; name: string }[];
    onChangeVisibility: (WDPAId: WDPA['id']) => void;
  }) => {
    const { items = [], onChangeVisibility } = options;

    return items.map(({ id, name }) => ({
      id,
      name,
      type: 'basic' as LegendItemType,
      icon: (
        <FaSquare
          className="h-3 w-3"
          style={{ color: COLORS['wdpa-preview'], minWidth: 12, minHeight: 12 }}
        />
      ),
      settingsManager: {
        opacity: true,
        visibility: true,
      },
      items: [],
      onChangeVisibility: () => {
        onChangeVisibility(id);
      },
    }));
  },

  'features-preview-new': (options: {
    items: { id: string; name: string; color: string }[];
    onChangeVisibility: (featureId: Feature['id']) => void;
  }) => {
    const { items, onChangeVisibility } = options;

    return items.map(({ name, id, color }) => ({
      id,
      name,
      type: 'basic' as LegendItemType,
      icon: <FaSquare className="h-3 w-3" style={{ color, minWidth: 12, minHeight: 12 }} />,
      settingsManager: {
        opacity: true,
        visibility: true,
      },
      items: [],
      onChangeVisibility: () => {
        onChangeVisibility?.(id);
      },
    }));
  },

  'features-preview': (options: UseLegend['options']) => {
    const { items } = options;

    return {
      id: 'features-preview',
      name: 'Features preview',
      type: 'basic' as LegendItemType,
      settingsManager: {
        opacity: true,
        visibility: true,
      },
      items: items.map((item, i) => {
        const COLOR =
          items.length > COLORS.features.ramp.length
            ? chroma.scale(COLORS.features.ramp).colors(items.length)[i]
            : COLORS.features.ramp[i];

        return {
          value: item.name,
          color: COLOR,
        };
      }),
    };
  },
  features: () => ({
    id: 'features',
    name: 'Features',
    icon: (
      <Icon
        icon={HEXAGON_SVG}
        className="mt-0.5 h-3.5 w-3.5 stroke-current stroke-2"
        style={{ color: COLORS.features }}
      />
    ),
    settingsManager: {
      opacity: true,
      visibility: true,
    },
  }),
  // 'features-highlight': () => ({
  //   id: 'features-highlight',
  //   name: 'Selected Features',
  //   icon: (
  //     <Icon
  //       icon={HEXAGON_SVG}
  //       className="mt-0.5 h-3.5 w-3.5 stroke-current stroke-2"
  //       style={{ color: COLORS.highlightFeatures }}
  //     />
  //   ),
  //   settingsManager: {
  //     opacity: true,
  //     visibility: true,
  //   },
  // }),

  // ANALYSIS
  ['features-abundance']: (options: {
    items: {
      id: Feature['id'];
      amountRange: { min: number; max: number };
      name: string;
      color: string;
    }[];
    onChangeVisibility?: (id: Feature['id']) => void;
  }) => {
    const { items, onChangeVisibility } = options;

    return items?.map(({ id, name, amountRange, color }) => ({
      id: `feature-abundance-${id}`,
      name,
      type: 'gradient' as LegendItemType,
      settingsManager: {
        opacity: true,
        visibility: true,
      },
      items: [
        {
          color: COLORS.features.default,
          value: `${amountRange.min === amountRange.max ? 0 : amountRange.min}`,
        },
        {
          color,
          value: `${amountRange.max}`,
        },
      ],
      onChangeVisibility: () => {
        onChangeVisibility?.(id);
      },
    }));
  },
  'cost-surface': (options: {
    items: { id: CostSurface['id']; name: CostSurface['name']; min?: number; max?: number }[];
    onChangeVisibility: () => void;
  }) => {
    const { items, onChangeVisibility } = options;

    return items?.map(({ id, name, min = 1, max = 100 }) => ({
      id,
      name,
      type: 'gradient' as LegendItemType,
      settingsManager: {
        opacity: true,
        visibility: true,
      },
      items: [
        {
          color: COLORS.cost[0],
          value: `${min === max ? 0 : min}`,
        },
        {
          color: COLORS.cost[1],
          value: null,
        },
        {
          color: COLORS.cost[2],
          value: null,
        },
        {
          color: COLORS.cost[3],
          value: `${max}`,
        },
      ],
      onChangeVisibility,
    }));
  },
  'lock-available': (options) => {
    const { puAvailableValue, onChangeVisibility } = options;

    return {
      id: 'lock-available',
      name: 'Available areas',
      icon: (
        <Icon
          icon={HEXAGON_SVG}
          className="mt-0.5 h-3.5 w-3.5 fill-none stroke-current stroke-2"
          style={{ color: COLORS.available }}
        />
      ),
      settingsManager: {
        opacity: true,
        visibility: true,
      },
      description: <div className="pl-5">{puAvailableValue.length} PU</div>,
      onChangeVisibility,
    };
  },
  'lock-in': (options) => {
    const { puIncludedValue, onChangeVisibility } = options;

    return {
      id: 'lock-in',
      name: 'Included areas',
      icon: (
        <Icon
          icon={HEXAGON_SVG}
          className="mt-0.5 h-3.5 w-3.5 fill-none stroke-current stroke-2"
          style={{ color: COLORS.include }}
        />
      ),
      settingsManager: {
        opacity: true,
        visibility: true,
      },
      description: <div className="pl-5">{puIncludedValue.length} PU</div>,
      onChangeVisibility,
    };
  },
  'lock-out': (options) => {
    const { puExcludedValue, onChangeVisibility } = options;

    return {
      id: 'lock-out',
      name: 'Excluded areas',
      icon: (
        <Icon
          icon={HEXAGON_SVG}
          className="mt-0.5 h-3.5 w-3.5 fill-none stroke-current stroke-2"
          style={{ color: COLORS.exclude }}
        />
      ),
      settingsManager: {
        opacity: true,
        visibility: true,
      },
      description: <div className="pl-5">{puExcludedValue.length} PU</div>,
      onChangeVisibility,
    };
  },

  'gap-analysis': (options: {
    items: { id: string; name: string }[];
    onChangeVisibility: (featureId: Feature['id']) => void;
  }) => {
    const { items, onChangeVisibility } = options;

    return items?.map(({ name, id }) => ({
      id,
      name,
      type: 'basic' as LegendItemType,
      icon: (
        <FaSquare
          className="h-3 w-3"
          style={{ color: COLORS.highlightFeatures, minWidth: 12, minHeight: 12 }}
        />
      ),
      settingsManager: {
        opacity: true,
        visibility: true,
      },
      items: [],
      onChangeVisibility: () => {
        onChangeVisibility?.(id);
      },
    }));
  },

  // SOLUTIONS
  frequency: (options: { numberOfRuns: number; onChangeVisibility?: () => void }) => {
    const { numberOfRuns, onChangeVisibility } = options;

    return {
      id: 'frequency',
      name: numberOfRuns ? `Frequency (${numberOfRuns} runs)` : 'Frequency',
      type: 'gradient' as LegendItemType,
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
      ...(onChangeVisibility && { onChangeVisibility }),
    };
  },
  solution: (options?: { onChangeVisibility?: () => void }) => ({
    id: 'solution',
    name: 'Best solution',
    icon: (
      <Icon
        icon={HEXAGON_SVG}
        className="mt-0.5 h-3.5 w-3.5 stroke-current stroke-2"
        style={{ color: COLORS.solution }}
      />
    ),
    settingsManager: {
      opacity: true,
      visibility: true,
    },
    onChangeVisibility: options?.onChangeVisibility,
  }),
  compare: (options: {
    scenario1: Scenario;
    scenario2: Scenario;
    onChangeVisibility: () => void;
  }) => {
    const { scenario1, scenario2, onChangeVisibility } = options;
    const COLOR_NUMBER = 10;
    const colors = [...Array((COLOR_NUMBER + 1) * (COLOR_NUMBER + 1)).keys()];

    const ramp = colors
      .map((c, i) => {
        const position = `${Math.floor((i / (COLOR_NUMBER + 1)) % (COLOR_NUMBER + 1))}${
          i % (COLOR_NUMBER + 1)
        }`;
        const color = Object.keys(COLORS.compare).reduce((acc, k) => {
          if (COLORS.compare[k].includes(position) && !acc) {
            return k;
          }

          return acc;
        }, '');

        return color;
      })
      .flat();

    return {
      id: 'compare',
      // name: 'Solutions distribution',
      type: 'matrix' as LegendItemType,
      settingsManager: {
        opacity: true,
        visibility: true,
      },
      onChangeVisibility,
      intersections: ramp.map((c, i) => ({ id: i, color: c })).reverse(),
      items: [
        {
          value: `${scenario1?.name}`,
          color: COLORS['compare-legend'][0],
        },
        {
          value: scenario2?.name,
          color: COLORS['compare-legend'][1],
        },
      ],
    };
  },
};
