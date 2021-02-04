import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import { withNextRouter } from 'storybook-addon-next-router';
import Wrapper, { WrapperProps } from './component';

export default {
  title: 'Layout/Wrapper',
  component: Wrapper,
  argTypes: {},
  decorators: [withNextRouter],
};

const Template: Story<WrapperProps> = ({ children, ...args }:WrapperProps) => (
  <Wrapper {...args}>
    {children}
  </Wrapper>
);

export const Default = Template.bind({});
Default.args = {
  children: (<div>Just testing</div>),
};
