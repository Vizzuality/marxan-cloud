import React from 'react';

import { Story } from '@storybook/react/types-6-0';

import BlmChart, { BlmChartProps } from './component';

export default {
  title: 'Components/Scenarios/BlmChart',
  component: BlmChart,
  argTypes: {},
};

const Template: Story<BlmChartProps> = ({ ...args }) => (
  <div style={{ width: 500, height: 280 }} className="bg-transparent pb-28">
    <BlmChart {...args} />
  </div>
);

export const Default: Story<BlmChartProps> = Template.bind({});
Default.args = {
  data: [
    {
      boundaryLength: 1.23,
      cost: 1.34,
      isBlm: false,
      thumbnail: '/images/avatar.png',
    },
    {
      boundaryLength: 1.12,
      cost: 1.42,
      isBlm: false,
      thumbnail: null,
    },
    {
      boundaryLength: 1.05,
      cost: 1.54,
      isBlm: true,
      thumbnail: '/images/avatar.png',
    },
    {
      boundaryLength: 0.92,
      cost: 1.82,
      isBlm: false,
      thumbnail: null,
    },
    {
      boundaryLength: 0.91,
      cost: 2.1,
      isBlm: false,
      thumbnail: '/images/avatar.png',
    },
    {
      boundaryLength: 0.79,
      cost: 2.29,
      isBlm: false,
      thumbnail: '/images/avatar.png',
    },
  ],
};
