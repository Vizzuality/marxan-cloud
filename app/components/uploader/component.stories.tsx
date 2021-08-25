import React from 'react';

import { Story } from '@storybook/react/types-6-0';

import Uploader, { UploaderProps } from './index';

export default {
  title: 'Components/Uploader',
  component: Uploader,
  parameters: { actions: { argTypesRegex: '^on.*' } },
  argTypes: {
    caption: {
      table: { category: 'UI' },
    },
    maxSize: {
    },
    multiple: {
      description: 'If true, it will be possible to upload more than one file',
    },
    setSuccessFile: {
      control: {
        disable: true,
      },
      table: { category: 'Events' },
    },
    onDropAccepted: {
      control: {
        disable: true,
      },
      table: { category: 'Events' },
    },
    onDropRejected: {
      control: {
        disable: true,
      },
      table: { category: 'Events' },
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
  caption: 'Upload file',
};
