import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import Radio, { RadioProps } from './component';

export default {
  title: 'Components/Forms/Radio',
  component: Radio,
  argTypes: {
    theme: {
      control: {
        type: 'select',
        options: ['dark', 'light'],
      },
    },
    status: {
      control: {
        type: 'select',
        options: ['none', 'valid', 'error', 'disabled'],
      },
    },
    InputHTMLAttributes: {
      name: 'InputHTMLAttributes',
      description: 'https://www.w3schools.com/tags/tag_textarea.asp',
      table: {
        type: {
          summary: 'InputHTMLAttributes',
          detail: null,
        },
      },
      control: {
        disabled: true,
      },
    },
  },
};

const Template: Story<RadioProps> = (args) => <Radio {...args} />;

export const Default = Template.bind({});
Default.args = {
  theme: 'dark',
};
