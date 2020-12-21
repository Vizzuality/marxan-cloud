import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import Map, { MapProps } from './component';

export default {
  title: 'Components/Map',
  component: Map,
  argTypes: {
    mapboxApiAccessToken: { control: { type: null } },
  },
};

const Template: Story<MapProps> = ({ children, ...args }: MapProps) => (
  <div className="w-full h-96">
    <Map {...args}>
      {(map) => {
        console.info(map);
      }}
    </Map>
  </div>
);

export const Default = Template.bind({});
Default.args = {
  mapboxApiAccessToken: process.env.MAPBOX_API_TOKEN,
  bounds: {
    bbox: [
      9.909667968749998,
      43.54854811091286,
      12.19482421875,
      44.35527821160296,
    ],
    options: {},
    viewportOptions: {
      transitionDuration: 0,
    },
  },
};
