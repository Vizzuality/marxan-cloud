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
  <div className="bg-green-500">
    <Wrapper {...args}>
      {children}
    </Wrapper>
  </div>
);

export const Default = Template.bind({});
Default.args = {
  children: (<div className="text-white uppercase font-heading bg-primary-800">Just testing</div>),
};
