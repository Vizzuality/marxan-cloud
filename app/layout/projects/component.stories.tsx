import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import { withNextRouter } from 'storybook-addon-next-router';
import Projects, { ProjectsProps } from './component';

export default {
  title: 'Layout/Projects',
  component: Projects,
  argTypes: {},
  decorators: [withNextRouter],
};

const Template: Story<ProjectsProps> = (args: ProjectsProps) => (
  <Projects {...args} />
);

export const Default = Template.bind({});
Default.args = {
};
