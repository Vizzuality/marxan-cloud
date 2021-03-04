import React, { useState } from 'react';
import { Story } from '@storybook/react/types-6-0';

import Button from 'components/button';
import MAP_WARNING from 'svgs/ui/map-warning.svg';
import AlertPrompt, { AlertPromptProps } from './component';

export default {
  title: 'Components/Prompts/AlertPrompt',
  component: AlertPrompt,
  parameters: { actions: { argTypesRegex: '^on.*' } },
  argTypes: {
    open: {
      control: {
        disable: true,
      },
    },
    onDismiss: {
      control: {
        disable: true,
      },
    },
    onAccept: {
      control: {
        disable: true,
      },
    },
    onClickSecondaryAction: {
      control: {
        disable: true,
      },
    },
  },
};

const Template: Story<AlertPromptProps> = ({ ...args }: AlertPromptProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button theme="primary" size="base" onClick={() => setOpen(true)}>
        Edit scenario
      </Button>
      <AlertPrompt
        {...args}
        open={open}
        onAccept={() => {
          console.log('Accepted alert');
          setOpen(false);
        }}
        onClickSecondaryAction={() => {
          console.log('Requested access');
          setOpen(false);
        }}
        onDismiss={() => setOpen(false)}
      />
    </>
  );
};

export const Default: Story<AlertPromptProps> = Template.bind({});
Default.args = {
  title: 'Roger is currently editing this scenario',
};

export const WithDescription: Story<AlertPromptProps> = Template.bind({});
WithDescription.storyName = 'With description';
WithDescription.args = {
  title: 'Roger is currently editing this scenario',
  description: 'As soon as they finish, you will be allowed to edit the scenario.',
};

export const WithIcon: Story<AlertPromptProps> = Template.bind({});
WithIcon.storyName = 'With icon';
WithIcon.args = {
  title: 'Roger is currently editing this scenario',
  icon: MAP_WARNING,
};

export const WithSecondaryAction: Story<AlertPromptProps> = Template.bind({});
WithSecondaryAction.storyName = 'With secondary action';
WithSecondaryAction.args = {
  title: 'Roger is currently editing this scenario',
  icon: MAP_WARNING,
  secondaryActionName: 'Request access',
};
