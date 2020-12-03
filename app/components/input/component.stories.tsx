import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import Input, { InputProps } from './component';

export default {
  title: 'Components/Input',
  component: Input,
  argTypes: {
    theme: {
      control: {
        type: 'select',
        options: ['primary'],
      },
    },
    size: {
      control: {
        type: 'select',
        options: ['base'],
      },
    },
  },
};

const Template: Story<InputProps> = (args) => <Input {...args} />;

export const Default = Template.bind({});
Default.args = {
  type: 'password',
  theme: 'primary',
};
