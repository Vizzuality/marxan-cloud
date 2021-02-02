import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import { withNextRouter } from 'storybook-addon-next-router';
import Header, { HeaderProps } from './component';

export default {
  title: 'Layout/Header',
  component: Header,
  argTypes: {},
  decorators: [withNextRouter],
};

const Template: Story<HeaderProps> = (args: HeaderProps) => (
  <Header {...args} />
);

export const Default = Template.bind({});
Default.args = {
  theme: 'primary',
};
