import React, { useEffect, useState } from 'react';

import Wrapper from 'layout/wrapper';

import Carousel from 'components/carousel';

import { IMAGES } from './constants';

export interface HomeCarouselProps {

}

export const HomeCarousel: React.FC<HomeCarouselProps> = () => {
  const [imgs, setImgs] = useState([]);
  const [imgsLoaded, setImgsLoaded] = useState(0);

  useEffect(() => {
    IMAGES.forEach((img) => {
      const IMG = new Image();
      IMG.src = img.src;
      IMG.onload = () => {
        setImgsLoaded((prevImgsLoaded) => prevImgsLoaded + 1);
      };
    });

    return () => {
      setImgs([]);
    };
  }, []); //eslint-disable-line

  useEffect(() => {
    if (imgsLoaded === IMAGES.length) {
      setImgs(IMAGES);
    }
  }, [imgsLoaded]);

  return (
    <div
      style={{
        background: 'linear-gradient(to bottom, #000 75%, #151515 25%)',
      }}
    >
      <Wrapper>
        <div className="flex justify-center w-full max-w-5xl px-10 mx-auto">
          {!!imgs.length && (
            <Carousel
              images={imgs}
            />
          )}
        </div>
      </Wrapper>
    </div>
  );
};

export default HomeCarousel;
