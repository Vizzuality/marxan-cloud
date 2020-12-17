import React from 'react';
import { Story } from '@storybook/react/types-6-0';
// import Icon from 'components/icon';
// import HELP_SVG from 'svgs/ui/help.svg';

import Avatar, { AvatarProps } from './component';

export default {
  title: 'Components/Avatar',
  component: Avatar,
  argTypes: {},
};

const Template: Story<AvatarProps> = ({ children, ...args }: AvatarProps) => (
  <Avatar {...args}>{children}</Avatar>
);

export const Default = Template.bind({});
Default.args = {
  // children: <Icon icon={HELP_SVG} className="w-5 h-5" />,
  bgImage: '/images/avatar.png',
  onClick: () => {
    console.info('Do stuff with the router');
  },
};
