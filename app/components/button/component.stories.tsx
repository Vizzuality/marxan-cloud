import React from 'react';

import { Story } from '@storybook/react/types-6-0';

import Button, { ButtonProps } from './component';

export default {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    size: {
      control: {
        type: 'select',
        options: ['xs', 's', 'base', 'lg'],
      },
    },
    theme: {
      control: {
        type: 'select',
        options: ['primary', 'primary-alt', 'secondary', 'secondary-alt', 'tertiary', 'danger', 'danger-alt', 'run', 'transparent-black', 'transparent-white'],
      },
    },
  },
};

const Template: Story<ButtonProps> = ({ children, ...args }: ButtonProps) => (
  <Button {...args}>{children}</Button>
);

export const Default = Template.bind({});
Default.args = {
  children: 'Button',
  theme: 'spacial',
  disabled: false,
};
