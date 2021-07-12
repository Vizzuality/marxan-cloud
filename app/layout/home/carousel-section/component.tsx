import React from 'react';

import Carousel from 'components/carousel';
import Wrapper from 'layout/wrapper';

import { IMAGES } from './constants';

export interface HomeCarouselProps {

}

export const HomeCarousel: React.FC<HomeCarouselProps> = () => {
  return (
    <Wrapper>
      <div className="relative p-40">
        <div className="w-full mb-24 bg-black h-96" />
        <div className="w-full h-56 bg-gray-700" />
        <div className="absolute flex justify-center top-2">
          <Carousel
            images={IMAGES}
            initial={0}
          />
        </div>
      </div>
    </Wrapper>
  );
};

export default HomeCarousel;
