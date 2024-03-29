import React from 'react';

import { useFocusRing } from '@react-aria/focus';
import { useSliderThumb } from '@react-aria/slider';
import { mergeProps } from '@react-aria/utils';
import { VisuallyHidden } from '@react-aria/visually-hidden';
import { SliderState } from '@react-stately/slider';

import { cn } from 'utils/cn';

const THEME = {
  dark: {
    thumb: 'absolute top-0 w-4 h-4 transform -translate-x-1/2 rounded-full bg-gray-800 border-2',
    status: {
      default: 'border-white',
      dragging: 'border-white opacity-80',
      focused: 'border-white ring-2 ring-primary-500',
      valid: 'border-green-600',
      error: 'border-red-600',
      disabled: 'border-white',
    },
  },
  light: {
    thumb: 'absolute top-0 w-4 h-4 transform -translate-x-1/2 rounded-full bg-gray-800 border-2',
    status: {
      default: 'border-white',
      dragging: 'border-white opacity-80',
      focused: 'border-white ring-2 ring-primary-500',
      valid: 'border-green-600',
      error: 'border-red-600',
      disabled: 'border-white',
    },
  },
  'dark-small': {
    thumb:
      'cursor-pointer absolute top-0 w-4 h-4 transform -translate-x-1/2 rounded-full bg-gray-800 border-2',
    status: {
      default: 'border-white',
      dragging: 'border-white opacity-80',
      focused: 'border-white ring-2 ring-primary-500',
      valid: 'border-green-600',
      error: 'border-red-600',
      disabled: 'border-white',
    },
  },
};

export interface ThumbProps {
  theme: 'dark' | 'light' | 'dark-small';
  status: 'none' | 'valid' | 'error' | 'disabled';
  sliderState: SliderState;
  trackRef: React.MutableRefObject<HTMLElement | null>;
  isDisabled: boolean;
  id?: string;
}

export const Thumb: React.FC<ThumbProps> = ({
  theme,
  status: rawState,
  sliderState,
  trackRef,
  isDisabled,
  id = undefined,
  ...rest
}: ThumbProps) => {
  const inputRef = React.useRef(null);
  const { thumbProps, inputProps } = useSliderThumb(
    {
      ...rest,
      id,
      index: 0,
      trackRef,
      inputRef,
      isDisabled,
    },
    sliderState
  );

  const { focusProps, isFocusVisible } = useFocusRing();

  let status: keyof typeof THEME.dark.status;
  if (isFocusVisible) {
    status = 'focused';
  } else if (sliderState.isThumbDragging(0)) {
    status = 'dragging';
  } else if (rawState === 'none') {
    status = 'default';
  } else {
    status = rawState;
  }

  const mergedInputProps = mergeProps(inputProps, focusProps, {
    // If `Slider` receives an `id` prop, `Thumb` receives it too, otherwise we default to what
    // `inputProps` provides
    id: id ?? inputProps.id,
  });

  return (
    <div
      {...thumbProps}
      className={cn({
        [THEME[theme].thumb]: true,
        [THEME[theme].status[status]]: true,
      })}
      style={{
        left: `${sliderState.getThumbPercent(0) * 100}%`,
      }}
    >
      <VisuallyHidden>
        <input ref={inputRef} {...mergedInputProps} />
      </VisuallyHidden>
    </div>
  );
};

export default Thumb;
