import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import Steps, { StepsProps } from './component';

export default {
  title: 'Components/Steps',
  component: Steps,
  argTypes: {},
};

const Template: Story<StepsProps> = (args: StepsProps) => (
  <Steps {...args} />
);

export const Default = Template.bind({});
Default.args = {
  step: 1,
  length: 5,
};
