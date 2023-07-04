import React from 'react';

import { Story } from '@storybook/react/types-6-0';

import Icon from 'components/icon';

import HELP_2_SVG from 'svgs/ui/help-2.svg?sprite';

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
  bgImage: '/images/avatar.png',
};

export const Groups = () => {
  return (
    <ul className="flex">
      <li>
        <Avatar bgImage="/images/avatar.png" />
      </li>
      <li className="-ml-3">
        <Avatar bgImage="/images/avatar.png" />
      </li>
      <li className="-ml-3">
        <Avatar bgImage="/images/avatar.png" />
      </li>
      <li className="-ml-3">
        <Avatar bgImage="/images/avatar.png" />
      </li>
      <li className="ml-3">
        <Avatar className="bg-white">
          <Icon icon={HELP_2_SVG} className="h-5 w-5" />
        </Avatar>
      </li>
    </ul>
  );
};
