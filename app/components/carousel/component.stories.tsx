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
  images: [
    {
      id: 1,
      alt: 'carousel',
      src: 'https://dummyimage.com/866x565/000/fff.png&text=01',
    },
    {
      id: 2,
      alt: 'carousel',
      src: 'https://dummyimage.com/866x565/000/fff.png&text=02',
    },
    {
      id: 3,
      alt: 'carousel',
      src: 'https://dummyimage.com/866x565/000/fff.png&text=03',
    },
    {
      id: 4,
      alt: 'carousel',
      src: 'https://dummyimage.com/866x565/000/fff.png&text=04',
    },
  ],
};
