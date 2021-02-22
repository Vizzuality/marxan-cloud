import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import Loading, { LoadingProps } from './component';

export default {
  title: 'Components/Loading',
  component: Loading,
};

const Template: Story<LoadingProps> = (args) => <Loading {...args} />;

export const Default = Template.bind({});
Default.args = {
  className: 'w-5 h-5 text-blue-500',
  visible: true,
};
