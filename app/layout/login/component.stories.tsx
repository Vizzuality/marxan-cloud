import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import { withNextRouter } from 'storybook-addon-next-router';
import Login, { LoginProps } from './component';

export default {
  title: 'Layout/Login',
  component: Login,
  argTypes: {},
  decorators: [withNextRouter],
};

const Template: Story<LoginProps> = (args: LoginProps) => (
  <Login {...args} />
);

export const Default = Template.bind({});
Default.args = {
};
