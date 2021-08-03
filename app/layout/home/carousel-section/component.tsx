import React, { useEffect, useState } from 'react';

import Wrapper from 'layout/wrapper';

import Carousel from 'components/carousel';

import BackgroundImage from 'images/home-carousel/bg-image.jpg';

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
      className="relative"
    >
      <div
        role="presentation"
        className="absolute top-0 left-0 w-full bg-center bg-cover"
        style={{
          backgroundImage: `url(${BackgroundImage})`,
          height: '70%',
        }}
      />
      <div
        role="presentation"
        className="absolute bottom-0 left-0 w-full bg-gray-700"
        style={{
          height: '30%',
        }}
      />
      <Wrapper>
        <div className="relative -top-8 flex justify-center w-full max-w-4xl px-10 pb-8 mx-auto">
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
