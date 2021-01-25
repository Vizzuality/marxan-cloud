import React, { useRef } from 'react';
import cx from 'classnames';

import { useSearchField } from '@react-aria/searchfield';
import { useSearchFieldState } from '@react-stately/searchfield';
import { useButton } from '@react-aria/button';

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

export interface SearchProps {
  theme?: 'dark' | 'light';
  size: 'sm' | 'base';
  placeholder?: string;
  className?: string;
}

export const Search: React.FC<SearchProps> = (props, {
  theme = 'dark',
  size = 'base',
  placeholder,
}: SearchProps) => {
  const state = useSearchFieldState(props);
  const ref = useRef();
  const buttonRef = useRef();
  const { inputProps, clearButtonProps } = useSearchField(props, state, ref);
  const { buttonProps } = useButton(clearButtonProps, buttonRef);

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
        <button type="button" ref={buttonRef} {...buttonProps}>
          <Icon
            icon={CLOSE_SVG}
            className="relative inline-block w-2 h-2"
          />
        </button>
      )}
    </div>
  );
};

export default Search;
