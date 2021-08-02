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
        style={{
          backgroundImage: `url(${BackgroundImage})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          position: 'absolute',
          top: '0',
          right: '0',
          height: '70%',
          width: '100%',
        }}
      />
      <div
        role="presentation"
        style={{
          background: '#151515',
          position: 'absolute',
          bottom: '0',
          right: '0',
          height: '30%',
          width: '100%',
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
