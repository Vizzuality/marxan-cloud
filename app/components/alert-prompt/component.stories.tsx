import React from 'react';
import { Story } from '@storybook/react/types-6-0';

import Button from 'components/button';
import MAP_WARNING from 'svgs/ui/map-warning.svg';
import AlertPrompt, { AlertPromptProps } from './component';

export default {
  title: 'Components/Prompts/AlertPrompt',
  component: AlertPrompt,
  parameters: { actions: { argTypesRegex: '^on.*' } },
  argTypes: {},
};

const Template: Story<AlertPromptProps> = ({ ...args }: AlertPromptProps) => (
  <AlertPrompt
    {...args}
    trigger={(
      <Button theme="primary" size="base" onClick={() => console.log('Clicked edit button')}>
        Edit scenario
      </Button>
    )}
  />
);

export const Default: Story<AlertPromptProps> = Template.bind({});
Default.args = {
  title: 'Roger is currently editing this scenario',
  onAccept: () => console.log('Accepted alert'),
  onDismiss: () => console.log('Dismissed alert'),
};

export const WithDescription: Story<AlertPromptProps> = Template.bind({});
WithDescription.storyName = 'With description';
WithDescription.args = {
  title: 'Roger is currently editing this scenario',
  description: 'As soon as they finish, you will be allowed to edit the scenario.',
  onAccept: () => console.log('Accepted alert'),
  onDismiss: () => console.log('Dismissed alert'),
};

export const WithIcon: Story<AlertPromptProps> = Template.bind({});
WithIcon.storyName = 'With icon';
WithIcon.args = {
  title: 'Roger is currently editing this scenario',
  icon: MAP_WARNING,
  onAccept: () => console.log('Accepted alert'),
  onDismiss: () => console.log('Dismissed alert'),
};

export const WithSecondaryAction: Story<AlertPromptProps> = Template.bind({});
WithSecondaryAction.storyName = 'With secondary action';
WithSecondaryAction.args = {
  title: 'Roger is currently editing this scenario',
  icon: MAP_WARNING,
  secondaryActionName: 'Request access',
  onAccept: () => console.log('Accepted alert'),
  onClickSecondaryAction: () => console.log('Requested access'),
  onDismiss: () => console.log('Dismissed alert'),
};
