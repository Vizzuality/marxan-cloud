import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import Search, { SearchProps } from './component';

export default {
  title: 'Components/Search',
  component: Search,
};

const Template: Story<SearchProps> = ({ ...args }: SearchProps) => (
  <Search {...args} />
);

export const Default = Template.bind({});
Default.args = {
  label: 'Search',
  placeholder: 'Search by feature, planning area name...',
};
