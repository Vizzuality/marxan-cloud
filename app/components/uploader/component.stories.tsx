import React, { useState } from 'react';

import { Story } from '@storybook/react/types-6-0';

import Uploader, { UploaderProps } from './index';

export default {
  title: 'Components/Uploader',
  component: Uploader,
  parameters: { actions: { argTypesRegex: '^on.*' } },
  argTypes: {},
};

const Template: Story<UploaderProps> = ({ ...args }: UploaderProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Uploader
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      {...args}
    >
      <div>You should render a form here</div>
    </Uploader>
  );
};

export const Default: Story<UploaderProps> = Template.bind({});
Default.args = {
  caption: 'Upload file',
};
