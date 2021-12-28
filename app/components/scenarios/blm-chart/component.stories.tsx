import React from 'react';

import { Story } from '@storybook/react/types-6-0';

import BlmChart, { BlmChartProps } from './component';

export default {
  title: 'Components/Scenarios/BlmChart',
  component: BlmChart,
  argTypes: {},
};

const Template: Story<BlmChartProps> = ({ ...args }) => (
  <div style={{ width: 400, height: 280 }} className="bg-white">
    <BlmChart {...args} />
  </div>
);

export const Default: Story<BlmChartProps> = Template.bind({});
Default.args = {
  data: [
    {
      boundaryLength: 1.43,
      cost: 1.34,
      isBlm: false,
      thumbnail: '/images/avatar.png',
    },
    {
      boundaryLength: 1.17,
      cost: 1.35,
      isBlm: false,
      thumbnail: null,
    },
    {
      boundaryLength: 0.49,
      cost: 1.43,
      isBlm: true,
      thumbnail: '/images/avatar.png',
    },
    {
      boundaryLength: 0.32,
      cost: 1.82,
      isBlm: false,
      thumbnail: null,
    },
    {
      boundaryLength: 0.31,
      cost: 2.1,
      isBlm: false,
      thumbnail: '/images/avatar.png',
    },
    {
      boundaryLength: 0.29,
      cost: 2.89,
      isBlm: false,
      thumbnail: '/images/avatar.png',
    },
  ],
};
