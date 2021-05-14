import React from 'react';
import Icon from 'components/icon';
import HEXAGON_SVG from 'svgs/map/hexagon.svg';

const ITEMS = [
  {
    id: 'XXX',
    name: 'Included areas',
    icon: <Icon icon={HEXAGON_SVG} className="w-3.5 h-3.5 mt-1 text-purple-500" />,
    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus minus eligendi doloremque unde, atque maxime dolore officiis quia architecto fugiat, dolorem animi vel! Velit minus facere maxime consequuntur iure. Nisi!',
  },
  {
    id: 'YYY',
    name: 'All features',
    icon: <div className="w-3 h-3 mt-1 bg-blue-500 rounded" />,
    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus minus eligendi doloremque unde, atque maxime.',
  },
  {
    id: 'ZZZ',
    name: 'Protected areas',
    icon: <div className="w-3 h-3 mt-1 bg-pink-500 rounded" />,
    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
  },
];

export default ITEMS;
