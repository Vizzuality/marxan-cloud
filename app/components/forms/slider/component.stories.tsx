import React from 'react';

import { Story } from '@storybook/react/types-6-0';

import Label from '../label';

import Slider, { SliderProps } from './component';

export default {
  title: 'Components/Forms/Slider',
  component: Slider,
  parameters: { actions: { argTypesRegex: '^on.*' } },
  argTypes: {
    theme: {
      control: {
        type: 'select',
        options: ['dark', 'light', 'light-small'],
      },
    },
    status: {
      control: {
        type: 'select',
        options: ['none', 'valid', 'error'],
      },
    },
    id: {
      control: {
        disable: true,
      },
    },
    labelRef: {
      control: {
        disable: true,
      },
    },
  },
};

const Template: Story<SliderProps> = (args: SliderProps) => {
  const labelRef = React.useRef(null);
  return (
    <>
      <Label ref={labelRef} id="slider-component" className="uppercase">
        Label
      </Label>
      <Slider id="slider-component" labelRef={labelRef} {...args} />
    </>
  );
};

export const Default = Template.bind({});
Default.args = {
  theme: 'dark',
  status: 'none',
  allowEdit: true,
  disabled: false,
  formatOptions: { style: 'percent' },
  minValue: 0,
  maxValue: 1,
  step: 0.01,
  defaultValue: 0.42,
};
