import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import Textarea, { TextareaProps } from './component';

export default {
  title: 'Components/Forms/Textarea',
  component: Textarea,
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
    state: {
      control: {
        type: 'select',
        options: ['none', 'valid', 'error', 'disabled'],
      },
    },
  },
};

const Template: Story<TextareaProps> = (args) => <Textarea {...args} />;

export const Default = Template.bind({});
Default.args = {
  type: 'text',
  theme: 'primary',
};
