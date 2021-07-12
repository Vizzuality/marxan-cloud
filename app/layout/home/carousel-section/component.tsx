import React from 'react';

import Carousel from 'components/carousel';
import Wrapper from 'layout/wrapper';

import { IMAGES } from './constants';

export interface HomeCarouselProps {

}

export const HomeCarousel: React.FC<HomeCarouselProps> = () => {
  return (
    <>
      <div className="w-full bg-black mt-52 h-96" />
      <div className="w-full h-64 bg-gray-700" />
      <Wrapper>

        <div className="relative w-full max-w-5xl mx-auto">

          <div className="absolute flex justify-center bottom-24">
            <Carousel
              images={IMAGES}
              initial={0}
            />
          </div>
        </div>
      </Wrapper>
    </>
  );
};

export default HomeCarousel;
