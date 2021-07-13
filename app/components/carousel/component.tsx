import React, { useEffect, useRef, useState } from 'react';

import { useKeenSlider } from 'keen-slider/react';

import cx from 'classnames';

export interface CarouselProps {
  images: {
    id: string | number;
    alt: string;
    src: string
  }[];
  initial?: number;
}

export const Carousel: React.FC<CarouselProps> = ({ images, initial = 0 }: CarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const timer = useRef(null);

  const [pause, setPause] = useState(false);
  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>({
    initial,
    loop: true,
    slideChanged(s) {
      setCurrentSlide(s.details().relativeSlide);
    },
  });

  useEffect(() => {
    sliderRef.current.addEventListener('mouseover', () => {
      setPause(true);
    });
    sliderRef.current.addEventListener('mouseout', () => {
      setPause(false);
    });
  }, [sliderRef]);

  useEffect(() => {
    timer.current = setInterval(() => {
      if (!pause && slider) {
        slider.next();
      }
    }, 2000);
    return () => {
      clearInterval(timer.current);
    };
  }, [pause, slider]);

  return (
    <div>
      <div className="relative">
        <div
          ref={sliderRef}
          className="bg-black keen-slider"
          style={{
            boxShadow: '0px 50px 50px rgba(0, 0, 0, 0.5)',
          }}
        >
          {images?.map((i) => (
            <img
              alt={i.alt}
              key={i.id}
              src={i.src}
              className="keen-slider__slide"
            />
          ))}
          <div>1</div>
        </div>
      </div>

      {slider && (
        <div className="flex flex-row items-center justify-center space-x-1 mt-14">
          {[...Array(slider.details().size).keys()].map((i) => {
            return (
              <button
                key={i}
                type="button"
                aria-label="dot-element"
                onClick={() => {
                  slider.moveToSlideRelative(i);
                }}
                className={cx({
                  'relative w-20': true,
                  'bg-blue-500 h-0.5': currentSlide === i,
                  'bg-gray-300 h-px': currentSlide !== i,
                })}
              >
                <div
                  className="absolute left-0 w-full h-3 transform -translate-y-1/2 bg-transparent top-1/2"
                />
              </button>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default Carousel;
