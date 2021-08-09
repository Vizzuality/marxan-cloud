import React from 'react';

import Icon from 'components/icon';

import HEXAGON_SVG from 'svgs/map/hexagon.svg?sprite';
import SQUARE_SVG from 'svgs/map/square.svg?sprite';

export const LEGEND_LAYERS = {
  pugrid: () => ({
    id: 'pugrid',
    name: 'PU grid',
    icon: <Icon icon={HEXAGON_SVG} className="w-3.5 h-3.5 mt-0.5 text-blue-500 stroke-current stroke-2 fill-none" />,
    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus minus eligendi doloremque unde, atque maxime dolore officiis quia architecto fugiat, dolorem animi vel! Velit minus facere maxime consequuntur iure. Nisi!',
  }),

  // WDPA
  'wdpa-preview': () => ({
    id: 'wdpa-preview',
    name: 'Protected areas preview',
    icon: <Icon icon={SQUARE_SVG} className="w-3.5 h-3.5 mt-0.5 text-blue-800" />,
  }),
  'wdpa-percentage': () => ({
    id: 'wdpa-percentage',
    name: 'Protected areas percentage',
    icon: <Icon icon={HEXAGON_SVG} className="w-3.5 h-3.5 mt-0.5 text-blue-800 stroke-current stroke-2" />,
  }),

  // ANALYSIS
  cost: () => ({
    id: 'cost',
    name: 'Cost surface',
    type: 'gradient',
    items: [
      {
        color: '#FFBFB7',
        value: '0',
      }, {
        color: '#C21701',
        value: '100',
      },
    ],
  }),
  'lock-in': (options) => {
    const { puIncludedValue } = options;

    return ({
      id: 'lock-in',
      name: 'Included areas',
      icon: <Icon icon={HEXAGON_SVG} className="w-3.5 h-3.5 mt-0.5 stroke-current stroke-2 fill-none" style={{ color: '#0F0' }} />,
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
      icon: <Icon icon={HEXAGON_SVG} className="w-3.5 h-3.5 mt-0.5 stroke-current stroke-2 fill-none" style={{ color: '#F00' }} />,
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
    items: [
      {
        color: '#0C2C32',
        value: '0',
      },
      {
        color: '#006D83',
        value: null,
      },
      {
        color: '#008B8C',
        value: null,
      },
      {
        color: '#0BC6C2',
        value: '100',
      },
    ],
  }),
  solution: () => ({
    id: 'solution',
    name: 'Solution selected',
    icon: <Icon icon={HEXAGON_SVG} className="w-3.5 h-3.5 mt-0.5 stroke-current stroke-2" style={{ color: '#00F' }} />,
  }),
};
