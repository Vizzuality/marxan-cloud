import React from 'react';

import { Story } from '@storybook/react/types-6-0';

import BlmChart2, { BlmChart2Props } from './component';

export default {
  title: 'Components/Scenarios/BlmChart2',
  component: BlmChart2,
  argTypes: {},
};

const Template: Story<BlmChart2Props> = ({ ...args }) => (
  <div style={{ width: 500, height: 280 }} className="bg-transparent pb-28">
    <BlmChart2 {...args} />
  </div>
);

export const Default: Story<BlmChart2Props> = Template.bind({});
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
