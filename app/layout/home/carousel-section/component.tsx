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
      style={{
        backgroundImage: `linear-gradient(to top, #151515 0, #151515 100px, transparent 100px, transparent 100%), url(${BackgroundImage})`,
        backgroundPosition: 'center, center -90px',
        backgroundSize: 'cover, cover',
      }}
    >
      <Wrapper>
        <div className="relative -top-8 flex justify-center w-full max-w-5xl px-10 mx-auto">
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
