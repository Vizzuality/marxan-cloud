import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import InfoButton, { InfoButtonProps } from './component';

export default {
  title: 'Components/InfoButton',
  component: InfoButton,
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
        options: ['primary', 'primary-alt', 'secondary', 'secondary-alt'],
      },
    },
  },
};

const Template: Story<InfoButtonProps> = ({ children, ...args }: InfoButtonProps) => (
  <InfoButton {...args}>{children}</InfoButton>
);

export const Default = Template.bind({});
Default.args = {
  children: 'InfoButton',
  disabled: false,
};
