import React, { useState } from 'react';

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
  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>({
    initial,
    loop: true,
    slideChanged(s) {
      setCurrentSlide(s.details().relativeSlide);
    },
  });

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
        <div className="flex flex-row items-center justify-center mt-14">
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
                  'mx-0.5 w-20': true,
                  'bg-blue-500 h-0.5': currentSlide === i,
                  'bg-gray-300 h-px': currentSlide !== i,
                })}
              />
            );
          })}
        </div>
      )}

    </div>
  );
};

export default Carousel;
