import React from 'react';

import Carousel from 'components/carousel';
import Wrapper from 'layout/wrapper';

import { IMAGES } from './constants';

export interface HomeCarouselProps {

}

export const HomeCarousel: React.FC<HomeCarouselProps> = () => {
  return (
    <div style={{
      background: 'linear-gradient(to bottom, #000 75%, #151515 25%)',
    }}
    >
      <Wrapper>
        <div className="flex justify-center w-full max-w-5xl px-10 mx-auto">
          <Carousel
            images={IMAGES}
            initial={0}
          />
        </div>
      </Wrapper>
    </div>
  );
};

export default HomeCarousel;
