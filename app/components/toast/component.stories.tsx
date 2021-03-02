import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import Toast, { ToastProps } from './component';

export default {
  title: 'Components/Toast',
  component: Toast,
  argTypes: {},
};

const Template: Story<ToastProps> = (args: ToastProps) => (
  <Toast
    key={args.level}
    {...args}
  />
);

export const Default = Template.bind({});
Default.args = {
  content: 'Source name',
  level: 'success',
};
