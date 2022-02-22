import React from 'react';

import { Story } from '@storybook/react/types-6-0';

import Carousel, { CarouselProps } from './component';

export default {
  title: 'Components/Carousel',
  component: Carousel,
  argTypes: {

  },
};

const Template: Story<CarouselProps> = ({ ...args }: CarouselProps) => (
  <Carousel {...args} />
);

export const Default = Template.bind({});
Default.args = {
  slides: [
    {
      id: 1,
      content: (
        <div
          className="relative w-full"
          style={{
            paddingBottom: '56.25%',
          }}
        >
          <div
            className="absolute w-full h-full bg-center bg-no-repeat bg-contain rounded-3xl"
            style={{
              backgroundImage: 'url(https://dummyimage.com/866x565/000/fff.png&text=01)',
            }}
          />
        </div>
      ),
    },
    {
      id: 2,
      content: (
        <div
          className="relative w-full"
          style={{
            paddingBottom: '56.25%',
          }}
        >
          <div
            className="absolute w-full h-full bg-center bg-no-repeat bg-contain rounded-3xl"
            style={{
              backgroundImage: 'url(https://dummyimage.com/866x565/000/fff.png&text=02)',
            }}
          />
        </div>
      ),
    },
    {
      id: 3,
      content: (
        <div
          className="relative w-full"
          style={{
            paddingBottom: '56.25%',
          }}
        >
          <div
            className="absolute w-full h-full bg-center bg-no-repeat bg-contain rounded-3xl"
            style={{
              backgroundImage: 'url(https://dummyimage.com/866x565/000/fff.png&text=03)',
            }}
          />
        </div>
      ),
    },
    {
      id: 4,
      content: (
        <div
          className="relative w-full"
          style={{
            paddingBottom: '56.25%',
          }}
        >
          <div
            className="absolute w-full h-full bg-center bg-no-repeat bg-contain rounded-3xl"
            style={{
              backgroundImage: 'url(https://dummyimage.com/866x565/000/fff.png&text=04)',
            }}
          />
        </div>
      ),
    },
  ],
};
