import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import Icon from 'components/icon';
import WARNING_SVG from 'svgs/ui/warning.svg';

import Tabs, { TabsProps } from './component';

export default {
  title: 'Components/Tabs',
  component: Tabs,
};

const Template: Story<TabsProps> = ({ ...args }: TabsProps) => (
  <Tabs {...args} />
);

export const Default = Template.bind({});
Default.args = {
  tabs: [
    {
      id: 1,
      name: 'Protected areas',
      status: 'disabled',
      warning: false,
      requirements: null,
    },
    {
      id: 2,
      name: 'Features',
      status: 'disabled',
      warning: true,
      requirements: (
        <>
          <div className="absolute w-4 h-4 bg-red-500 border-4 border-gray-700 border-solid rounded-full text-lg text-white -top-1 -right-1" />
          <div className="relative flex items-center w-7 h-7 mr-5 border border-white border-solid rounded-full text-white">
            <Icon className="w-10 h-10" icon={WARNING_SVG} />
            <div className="absolute w-4 h-4 bg-red-500 border-4 border-gray-700 border-solid rounded-full text-lg text-white -top-1 -right-1" />
          </div>

          <p className="text-red-500 text-sm pr-4">
            2 Features don&apos;t met target
          </p>
          <button
            type="button"
            className="text-white text-xs underline focus:outline-none"
            onClick={() => {
              console.info('clicked on features, set it to active');
            }}
          >
            Go to features
          </button>
        </>
      ),
    },
    {
      id: 3,
      name: 'Analysis',
      status: 'disabled',
      warning: false,
      requirements: null,
    },
    {
      id: 4,
      name: 'Solutions',
      status: 'active',
      warning: false,
      requirements: null,
    },
  ],
  onClick: (e) => {
    console.info('onClick', e);
  },
};
