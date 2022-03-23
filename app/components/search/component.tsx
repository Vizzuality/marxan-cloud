import React, { useRef } from 'react';

// react aria
import { useButton } from '@react-aria/button'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { useSearchField } from '@react-aria/searchfield';
import { useSearchFieldState } from '@react-stately/searchfield';
// react types
import { AriaSearchFieldProps } from '@react-types/searchfield';
import cx from 'classnames';

import Icon from 'components/icon';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite'; // eslint-disable-line @typescript-eslint/no-unused-vars
import SEARCH_SVG from 'svgs/ui/search.svg?sprite';

const THEME = {
  dark: 'text-white',
  light: 'text-black',
};

const SIZES = {
  sm: 'text-sm h-10',
  base: 'text-base h-12',
};

export interface SearchProps extends AriaSearchFieldProps {
  theme?: 'dark' | 'light';
  size: 'sm' | 'base';
}

export const Search: React.FC<SearchProps> = ({
  theme = 'dark',
  size = 'base',
  ...rest
}: SearchProps) => {
  const { placeholder } = rest;
  const state = useSearchFieldState(rest);

  const ref = useRef();
  const {
    inputProps,
    clearButtonProps,
  } = useSearchField(rest, state, ref);
  const { buttonProps } = useButton(clearButtonProps, null);

  return (
    <div
      className={cx(
        'flex w-full relative border-b border-gray-400',
        {
          [THEME[theme]]: true,
          [SIZES[size]]: true,
        },
      )}
    >
      <Icon
        icon={SEARCH_SVG}
        className={cx({
          'absolute top-1/2 left-1 w-4.5 h-4.5 transform -translate-y-1/2': true,
          [THEME[theme]]: true,
        })}
      />

      <input
        {...inputProps}
        ref={ref}
        placeholder={placeholder}
        type="search"
        className={cx(
          'w-full font-sans px-9 bg-transparent truncate focus:outline-none leading-4 placeholder-gray-300 placeholder-opacity-50',
          {
            [THEME[theme]]: true,
            [SIZES[size]]: true,
          },
        )}
      />

      {state.value !== '' && (
        <button
          aria-label="close"
          className="relative flex items-center self-center justify-center w-5 h-5"
          type="button"
          {...buttonProps}
        >
          <Icon
            icon={CLOSE_SVG}
            className="inline-block w-2 h-2"
          />
        </button>
      )}
    </div>
  );
};

export default Search;
