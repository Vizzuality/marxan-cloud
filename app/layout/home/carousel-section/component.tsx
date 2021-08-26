import React, { useEffect, useState } from 'react';

import { Media } from 'layout/media';
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
      className="relative pt-10 -mx-10 md:py-0 md:mx-0"
    >
      <Media greaterThanOrEqual="md">
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
      </Media>

      <Wrapper>
        <div className="relative flex justify-center w-full max-w-4xl pb-8 m-auto md:px-10 md:-top-8">
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
