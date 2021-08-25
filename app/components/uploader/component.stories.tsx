import React from 'react';

import { Story } from '@storybook/react/types-6-0';

import Uploader, { UploaderProps } from './index';

export default {
  title: 'Components/Uploader',
  component: Uploader,
  parameters: { actions: { argTypesRegex: '^on.*' } },
  argTypes: {
    open: {
      control: {
        disable: true,
      },
    },
    onDismiss: {
      control: {
        disable: true,
      },
    },
  },
};

const Template: Story<UploaderProps> = ({ ...args }: UploaderProps) => {
  return (
    <>
      <Uploader
        {...args}
      />
    </>
  );
};

export const Default: Story<UploaderProps> = Template.bind({});
Default.args = {

};
