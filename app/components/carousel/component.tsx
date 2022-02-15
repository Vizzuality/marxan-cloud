import React, {
  ReactElement, useEffect, useRef, useState,
} from 'react';

import Flicking, { ERROR_CODE, FlickingError } from '@egjs/react-flicking';
import cx from 'classnames';

import Icon from 'components/icon';

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
    <div className="relative w-full">

      <button
        type="button"
        aria-label="dot-element"
        onClick={() => slider.current.prev()}
        className="absolute flex items-center justify-center invisible w-16 h-16 border border-gray-500 rounded-full md:visible -left-36 top-12 opacity-30 hover:opacity-90"
      >
        <Icon className="w-3 h-3 text-black" icon={ARROW_LEFT_SVG} />
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
          circular
          onWillChange={({ index }) => {
            setSlide(index);
          }}
        >
          {slides.map((sl) => {
            return (
              <div
                key={sl.id}
                className="w-full"
              >
                {sl.content}
              </div>
            );
          })}
        </Flicking>

      </div>

      <div className="flex flex-row items-center justify-center space-x-1 mt-14">
        {slides.map((sl, i) => {
          return (
            <button
              key={sl.id}
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
      <button
        type="button"
        aria-label="dot-element"
        onClick={() => slider.current.next()}
        className="absolute flex items-center justify-center invisible w-16 h-16 border border-gray-500 rounded-full md:visible top-12 -right-36 opacity-30 hover:opacity-90"
      >
        <Icon className="w-3 h-3 text-black" icon={ARROW_RIGHT_SVG} />
      </button>

    </div>
  );
};

export default Carousel;
