import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import Icon, { IconProps } from './component';

import DOWNLOAD_SVG from 'svgs/ui/download.svg';

export default {
  title: 'Components/Icon',
  component: Icon,
};

const Template: Story<IconProps> = (args) => <Icon {...args} />;

export const Default = Template.bind({});
Default.args = {
  className: 'w-5 h-5 text-blue-500',
  icon: DOWNLOAD_SVG,
};
