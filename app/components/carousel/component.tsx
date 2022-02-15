import React, { useEffect, useRef, useState } from 'react';

import Flicking, { ERROR_CODE, FlickingError } from '@egjs/react-flicking';
import cx from 'classnames';

export interface CarouselProps {
  slides: {
    id: string | number;
    alt: string;
    src: string
  }[];
}

export const Carousel: React.FC<CarouselProps> = ({ slides }: CarouselProps) => {
  const slider = useRef(null);
  const timer = useRef(null);
  const [slide, setSlide] = useState(0);
  const [pause, setPause] = useState(false);

  useEffect(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      if (!pause && slider) {
        slider.current
          .next()
          .catch((err) => {
            if (!(
              err instanceof FlickingError
              && (
                err.code === ERROR_CODE.ANIMATION_ALREADY_PLAYING
                || err.code === ERROR_CODE.ANIMATION_INTERRUPTED
              )
            )) {
              throw err;
            }
          });
      }
    }, 4000);

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [pause, slider, slide]);

  return (
    <div
      className="w-full"
    >
      <div
        role="presentation"
        className="overflow-hidden bg-black rounded-3xl"
        style={{
          boxShadow: '0px 50px 50px rgba(0, 0, 0, 0.5)',
        }}
        onMouseOver={() => {
          if (timer.current) clearInterval(timer.current);
          setPause(true);
        }}
        onFocus={() => {
          if (timer.current) clearInterval(timer.current);
          setPause(true);
        }}
        onMouseOut={() => {
          if (timer.current) clearInterval(timer.current);
          setPause(false);
        }}
        onBlur={() => {
          if (timer.current) clearInterval(timer.current);
          setPause(false);
        }}
      >
        <Flicking
          ref={slider}
          circular
          onWillChange={({ index }) => {
            setSlide(index);
          }}
        >
          {slides.map((img) => {
            return (
              <div
                key={img.id}
                className="w-full"
              >
                <div
                  className="relative w-full"
                  style={{
                    paddingBottom: '56.25%',
                  }}
                >
                  <div
                    className="absolute w-full h-full bg-center bg-no-repeat bg-contain rounded-3xl"
                    style={{
                      backgroundImage: `url(${img.src})`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </Flicking>
      </div>

      <div className="flex flex-row items-center justify-center space-x-1 mt-14">
        {slides.map((img, i) => {
          return (
            <button
              key={img.id}
              type="button"
              aria-label="dot-element"
              onClick={() => {
                slider.current.moveTo(i);
              }}
              className={cx({
                'relative w-20': true,
                'bg-blue-500 h-1': slide === i,
                'bg-gray-300 h-0.5': slide !== i,
              })}
            >
              <div
                className="absolute left-0 w-full h-3 transform -translate-y-1/2 bg-transparent top-1/2"
              />
            </button>
          );
        })}
      </div>

    </div>
  );
};

export default Carousel;
