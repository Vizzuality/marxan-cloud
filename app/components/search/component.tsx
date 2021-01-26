import React, { useRef, useEffect } from 'react';
import cx from 'classnames';

// react aria
import { useSearchField } from '@react-aria/searchfield';
import { useSearchFieldState } from '@react-stately/searchfield';
import { useButton } from '@react-aria/button';
import { setInteractionModality } from '@react-aria/interactions';

// react types
import { AriaSearchFieldProps } from '@react-types/searchfield';

import Icon from 'components/icon';
import SEARCH_SVG from 'svgs/ui/search.svg';
import CLOSE_SVG from 'svgs/ui/close.svg';

const THEME = {
  dark: 'text-white',
  light: 'text-black',
};

const SIZES = {
  sm: 'text-sm',
  base: 'text-base',
};

export interface SearchProps extends AriaSearchFieldProps {
  theme?: 'dark' | 'light';
  size: 'sm' | 'base';
  labelRef: React.MutableRefObject<HTMLLabelElement | null>;
}

export const Search: React.FC<SearchProps> = ({
  theme = 'dark',
  size = 'base',
  labelRef,
  ...rest
}: SearchProps) => {
  const { placeholder } = rest;
  const state = useSearchFieldState(rest);

  const ref = useRef();
  const { inputProps, clearButtonProps } = useSearchField(rest, state, ref);
  const { buttonProps } = useButton(clearButtonProps, null);
  console.log(inputProps, clearButtonProps);

  useEffect(() => {
    const label = labelRef.current;
    // https://github.com/adobe/react-spectrum/blob/main/packages/%40react-aria/slider/src/useSlider.ts#L178-L181
    const handler = () => setInteractionModality('keyboard');

    if (label) {
      label.addEventListener('click', handler);
    }

    return () => {
      if (label) {
        label.removeEventListener('click', handler);
      }
    };
  }, [labelRef]);

  return (
    <div
      className={cx(
        'flex w-full relative border-b border-gray-400 p-4',
        { [THEME[theme]]: true },
        { [SIZES[size]]: true },
      )}
    >
      <Icon
        icon={SEARCH_SVG}
        className="absolute top-1\/2 left-1 w-4.5 h-4.5 fill-current"
      />
      <input
        {...inputProps}
        ref={ref}
        placeholder={placeholder}
        aria-label="search field"
        type="search"
        className={cx(
          'w-full pl-5 bg-transparent truncate focus:outline-none leading-4 placeholder-gray-300 placeholder-opacity-50',
          { [THEME[theme]]: true },
        )}
      />
      {state.value !== '' && (
        <button type="button" {...buttonProps}>
          <Icon
            icon={CLOSE_SVG}
            className="absolute inline-block w-2 h-2 right-1 top-1\/2"
          />
        </button>
      )}
    </div>
  );
};

export default Search;
