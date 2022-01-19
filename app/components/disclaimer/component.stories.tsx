import React from 'react';

import { Story } from '@storybook/react/types-6-0';

import Disclaimer, { DisclaimerProps } from './component';

export default {
  title: 'Components/Disclaimer',
  component: Disclaimer,
  argTypes: {},
};

const Template: Story<DisclaimerProps> = ({ children, ...args }: DisclaimerProps) => (
  <Disclaimer {...args}>{children}</Disclaimer>
);

export const Warning = Template.bind({});
Warning.args = {
  children: 'Your BLM is outdated, recalibrate',
  type: 'warning',
};

export const Blocked = Template.bind({});
Blocked.args = {
  children: 'Your solutions are outdated, re-run Marxan',
  type: 'blocked',
};

export const Invalidated = Template.bind({});
Invalidated.args = {
  children: 'Any change on this section will invalidate current solutions',
  type: 'invalidated',
};
