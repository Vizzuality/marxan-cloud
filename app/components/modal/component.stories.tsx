import React, { useState } from 'react';
import { Story } from '@storybook/react/types-6-0';

import Button from 'components/button';
import Modal, { ModalProps } from './component';

export default {
  title: 'Components/Modal',
  component: Modal,
  parameters: { actions: { argTypesRegex: '^on.*' } },
  argTypes: {
    open: {
      control: {
        disable: true,
      },
    },
  },
};

const Template: Story<ModalProps> = ({ ...args }: ModalProps) => {
  const [open, setOpen] = useState(false);

  const onOpen = () => setOpen(true);
  const onClose = (e) => {
    setOpen(false);
    args.onClose(e);
  };

  return (
    <>
      <Button theme="primary" size="base" onClick={onOpen}>
        Open modal
      </Button>
      <Modal {...args} open={open} onClose={onClose}>
        <h1 className="mb-5 text-xl font-medium">Modal content</h1>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean at
        sodales est, eu imperdiet elit. Suspendisse eget diam accumsan, lacinia
        odio nec, fringilla ex. Quisque consectetur diam in massa egestas, vitae
        posuere magna semper. Sed ac iaculis purus, at pretium tellus. Duis non
        commodo lorem, non tincidunt ex.
      </Modal>
    </>
  );
};

export const Default = Template.bind({});
Default.args = {
  title: 'Modal component',
  open: false,
};
