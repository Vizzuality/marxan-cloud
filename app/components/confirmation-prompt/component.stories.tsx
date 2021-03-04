import React, { useState } from 'react';
import { Story } from '@storybook/react/types-6-0';

import Button from 'components/button';
import MAP_WARNING from 'svgs/ui/map-warning.svg';
import ConfirmationPrompt, { ConfirmationPromptProps } from './component';

export default {
  title: 'Components/ConfirmationPrompt',
  component: ConfirmationPrompt,
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
    onRefuse: {
      control: {
        disable: true,
      },
    },
  },
};

const Template: Story<ConfirmationPromptProps> = ({ ...args }: ConfirmationPromptProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button theme="primary" size="base" onClick={() => setOpen(true)}>
        Delete
      </Button>
      <ConfirmationPrompt
        {...args}
        open={open}
        onAccept={() => {
          console.log('Accepted deletion');
          setOpen(false);
        }}
        onRefuse={() => {
          console.log('Refused deletion');
          setOpen(false);
        }}
        onDismiss={() => setOpen(false)}
      />
    </>
  );
};

export const Default: Story<ConfirmationPromptProps> = Template.bind({});
Default.args = {
  title: 'Are you sure you want to delete this item?',
};

export const WithDescription: Story<ConfirmationPromptProps> = Template.bind({});
WithDescription.storyName = 'With description';
WithDescription.args = {
  title: 'Are you sure you want to delete this item?',
  description: 'The action cannot be reverted.',
};

export const WithIcon: Story<ConfirmationPromptProps> = Template.bind({});
WithIcon.storyName = 'With icon';
WithIcon.args = {
  title: 'Are you sure you want to delete this item?',
  icon: MAP_WARNING,
};
