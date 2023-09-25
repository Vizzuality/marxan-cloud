import React, { ReactElement, useEffect, useRef, useState } from 'react';

import Flicking, { ERROR_CODE, FlickingError } from '@egjs/react-flicking';

import Icon from 'components/icon';
import { cn } from 'utils/cn';

import ARROW_LEFT_SVG from 'svgs/ui/arrow-left.svg?sprite';
import ARROW_RIGHT_SVG from 'svgs/ui/arrow-right.svg?sprite';

export interface CarouselProps {
  slides: {
    id: string | number;
    content?: ReactElement;
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
        slider.current.next().catch((err) => {
          if (
            !(
              err instanceof FlickingError &&
              (err.code === ERROR_CODE.ANIMATION_ALREADY_PLAYING ||
                err.code === ERROR_CODE.ANIMATION_INTERRUPTED)
            )
          ) {
            throw err;
          }
        });
      }
    }, 3000);

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [pause, slider, slide]);

  return (
    <div className="relative w-full">
      <button
        type="button"
        aria-label="dot-element"
        onClick={() => slider.current.prev()}
        className="absolute -left-36 top-12 flex h-16 w-16 items-center justify-center rounded-full border border-gray-600 opacity-30 hover:opacity-90"
      >
        <Icon className="h-3 w-3 text-black" icon={ARROW_LEFT_SVG} />
      </button>

      <div
        role="presentation"
        className="overflow-hidden"
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
          duration={0}
          circular
          onWillChange={({ index }) => {
            setSlide(index);
          }}
        >
          {slides.map((sl) => {
            return (
              <div key={sl.id} className="w-full">
                {sl.content}
              </div>
            );
          })}
        </Flicking>
      </div>

      <div className="mt-14 flex flex-row items-center justify-center space-x-1">
        {slides.map((sl, i) => {
          return (
            <button
              key={sl.id}
              type="button"
              aria-label="dot-element"
              onClick={() => {
                slider.current.moveTo(i);
              }}
              className={cn({
                'relative w-20': true,
                'h-1 bg-blue-600': slide === i,
                'h-0.5 bg-gray-400': slide !== i,
              })}
            >
              <div className="absolute left-0 top-1/2 h-3 w-full -translate-y-1/2 transform bg-transparent" />
            </button>
          );
        })}
      </div>
      <button
        type="button"
        aria-label="dot-element"
        onClick={() => slider.current.next()}
        className="absolute -right-36 top-12 flex h-16 w-16 items-center justify-center rounded-full border border-gray-600 opacity-30 hover:opacity-90"
      >
        <Icon className="h-3 w-3 text-black" icon={ARROW_RIGHT_SVG} />
      </button>
    </div>
  );
};

export default Carousel;
