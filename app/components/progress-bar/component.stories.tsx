import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import ProgressBar, { ProgressBarProps } from './component';

export default {
  title: 'Components/ProgressBar',
  component: ProgressBar,
};

const Template: Story<ProgressBarProps> = (args) => <ProgressBar {...args} />;

export const Default = Template.bind({});
Default.args = {
  progress: 30,
};
