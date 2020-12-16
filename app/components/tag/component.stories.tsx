import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import Tag, { TagProps } from './component';

export default {
  title: 'Components/Tag',
  component: Tag,
  argTypes: {
    size: {
      control: {
        type: 'select',
        options: ['s', 'base'],
      },
    },
  },
};

const Template: Story<TagProps> = ({ children, ...args }: TagProps) => (
  <Tag {...args}>{children}</Tag>
);

export const Default = Template.bind({});
Default.args = {
  children: 'Source name',
  removable: true,
  onRemove: () => {
    console.info('Clicked on remove tag');
  },
};
