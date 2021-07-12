import React, { useState } from 'react';

import { useKeenSlider } from 'keen-slider/react';

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
    slideChanged(s) {
      setCurrentSlide(s.details().relativeSlide);
    },
  });

  return (
    <div>
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
      <div className="flex flex-row items-center justify-center py-10">
        {[...Array(slider.details().size).keys()].map((i) => {
          return (
            <button
              key={i}
              type="button"
              aria-label="dot-element"
              onClick={() => {
                slider.moveToSlideRelative(i);
              }}
              className={`mx-2 w-14 ${currentSlide === i ? 'bg-blue-500 h-0.5' : 'bg-gray-300 h-px'}`}
            />
          );
        })}
      </div>
      )}
    </div>
  );
};

export default Carousel;
