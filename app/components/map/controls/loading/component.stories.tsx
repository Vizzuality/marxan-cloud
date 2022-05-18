import React from 'react';

import { Story } from '@storybook/react/types-6-0';

import LoadingControl, { LoadingControlProps } from './component';

export default {
  title: 'Components/Map/Controls/Loading',
  component: LoadingControl,
};

const Template: Story<LoadingControlProps> = (args) => {
  return (
    <LoadingControl
      {...args}
    />
  );
};

export const Default = Template.bind({});
Default.args = {};
