import React, { useState } from 'react';
import { Story } from '@storybook/react/types-6-0';

import Tabs, { TabsProps } from './component';

export default {
  title: 'Components/Tabs',
  component: Tabs,
};

const Template: Story<TabsProps> = ({ ...args }: TabsProps) => {
  const [selected, setSelected] = useState(args.selected);
  return (
    <Tabs
      {...args}
      selected={selected}
      onSelected={(s) => setSelected(s)}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  items: [
    {
      id: 1,
      name: 'Protected areas',
      warning: false,
    },
    {
      id: 2,
      name: 'Features',
      warning: true,
    },
    {
      id: 3,
      name: 'Analysis',
      warning: false,
    },
    {
      id: 4,
      name: 'Solutions',
      warning: false,
    },
  ],
  selected: 4,
  onChangeSelected: (e) => {
    console.info('onChangeSelected', e);
  },
};
