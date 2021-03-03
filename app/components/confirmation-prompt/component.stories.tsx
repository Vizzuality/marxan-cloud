import React from 'react';
import { Story } from '@storybook/react/types-6-0';

import Button from 'components/button';
import MAP_WARNING from 'svgs/ui/map-warning.svg';
import ConfirmationPrompt, { ConfirmationPromptProps } from './component';

export default {
  title: 'Components/Prompts/ConfirmationPrompt',
  component: ConfirmationPrompt,
  parameters: { actions: { argTypesRegex: '^on.*' } },
  argTypes: {},
};

const Template: Story<ConfirmationPromptProps> = ({ ...args }: ConfirmationPromptProps) => (
  <ConfirmationPrompt
    {...args}
    trigger={(
      <Button theme="primary" size="base" onClick={() => console.log('Clicked delete button')}>
        Delete
      </Button>
    )}
  />
);

export const Default: Story<ConfirmationPromptProps> = Template.bind({});
Default.args = {
  title: 'Are you sure you want to delete this item?',
  onAccept: () => console.log('Accepted deletion'),
  onRefuse: () => console.log('Refused deletion'),
  onDismiss: () => console.log('Dismissed deletion'),
};

export const WithDescription: Story<ConfirmationPromptProps> = Template.bind({});
WithDescription.storyName = 'With description';
WithDescription.args = {
  title: 'Are you sure you want to delete this item?',
  description: 'The action cannot be reverted.',
  onAccept: () => console.log('Accepted deletion'),
  onRefuse: () => console.log('Refused deletion'),
  onDismiss: () => console.log('Dismissed deletion'),
};

export const WithIcon: Story<ConfirmationPromptProps> = Template.bind({});
WithIcon.storyName = 'With icon';
WithIcon.args = {
  title: 'Are you sure you want to delete this item?',
  icon: MAP_WARNING,
  onAccept: () => console.log('Accepted deletion'),
  onRefuse: () => console.log('Refused deletion'),
  onDismiss: () => console.log('Dismissed deletion'),
};
