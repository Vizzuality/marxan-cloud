import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import Error, { ErrorProps } from './component';

export default {
  title: 'Components/Forms/Error',
  component: Error,
  argTypes: {
  },
};

const Template: Story<ErrorProps> = (args) => (
  <Error {...args}>
    Invalid username or password.
  </Error>
);

export const Default = Template.bind({});
Default.args = {
  visible: true,
};
