import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import Breadcrum, { BreadcrumProps } from './component';

export default {
  title: 'Components/Breadcrum',
  component: Breadcrum,
  argTypes: {},
};

const Template: Story<BreadcrumProps> = ({
  children,
  ...args
}: BreadcrumProps) => <Breadcrum {...args}>{children}</Breadcrum>;

export const Default = Template.bind({});
Default.args = {
  children: 'All projects',
  onClick: (e) => {
    console.info('onClick', e);
  },
};
