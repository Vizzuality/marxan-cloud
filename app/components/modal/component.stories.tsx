import React from 'react';
import { Story } from '@storybook/react/types-6-0';

import Button from 'components/button';
import Modal, { ModalProps } from './component';

export default {
  title: 'Components/Modal',
  component: Modal,
  parameters: { actions: { argTypesRegex: '^on.*' } },
  argTypes: {},
};

const Template: Story<ModalProps> = ({ ...args }: ModalProps) => (
  <Modal
    {...args}
    trigger={(
      <Button theme="primary" size="base">
        Open modal
      </Button>
    )}
  >
    <h1 className="mb-5 text-xl font-medium">Modal content</h1>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean at
    sodales est, eu imperdiet elit. Suspendisse eget diam accumsan, lacinia
    odio nec, fringilla ex. Quisque consectetur diam in massa egestas, vitae
    posuere magna semper. Sed ac iaculis purus, at pretium tellus. Duis non
    commodo lorem, non tincidunt ex.
  </Modal>
);

export const Default: Story<ModalProps> = Template.bind({});
Default.args = {
  title: 'Modal component',
  dismissable: true,
};
