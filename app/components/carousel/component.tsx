import React, { useState } from 'react';

import { useKeenSlider } from 'keen-slider/react';

export interface CarouselProps {
  images: [{id: string, alt: string, src: string}];
}

export const Carousel: React.FC<CarouselProps> = ({ images }: CarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    slideChanged(s) {
      setCurrentSlide(s.details().relativeSlide);
    },
  });

  return (
    <div className="w-2/6">
      <div className="relative">
        <div ref={sliderRef} className="keen-slider">
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
      <div className="flex py-2.5 justify-center">
        {[...Array(slider.details().size).keys()].map((i) => {
          return (
            <button
              key={i}
              type="button"
              aria-label="dot-element"
              onClick={() => {
                slider.moveToSlideRelative(i);
              }}
              className={currentSlide === i ? 'w-14  bg-blue-500 h-px mx-2.5' : 'w-14 bg-gray-300 h-px mx-2.5'}
            />
          );
        })}
      </div>
      )}
    </div>
  );
};

export default Carousel;
