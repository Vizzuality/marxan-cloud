import { useRef } from 'react';

import { useButton } from '@react-aria/button'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { useSearchField } from '@react-aria/searchfield';
import { useSearchFieldState } from '@react-stately/searchfield';
import { AriaSearchFieldProps } from '@react-types/searchfield';

import Icon from 'components/icon';
import { cn } from 'utils/cn';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';
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

export const Search = ({ theme = 'dark', size = 'base', ...rest }: SearchProps) => {
  const { placeholder } = rest;
  const state = useSearchFieldState(rest);

  const ref = useRef();
  const { inputProps, clearButtonProps } = useSearchField(rest, state, ref);
  const { buttonProps } = useButton(clearButtonProps, null);

  return (
    <div
      className={cn('relative flex w-full border-b border-gray-700', {
        [THEME[theme]]: true,
        [SIZES[size]]: true,
      })}
    >
      <Icon
        icon={SEARCH_SVG}
        className={cn({
          'absolute left-1 top-1/2 h-4 w-4 -translate-y-1/2 transform': true,
          [THEME[theme]]: true,
        })}
      />

      <input
        {...inputProps}
        ref={ref}
        placeholder={placeholder}
        type="search"
        className={cn(
          'w-full truncate bg-transparent px-9 font-sans leading-4 placeholder-gray-400 placeholder-opacity-50 focus:outline-none',
          {
            [THEME[theme]]: true,
            [SIZES[size]]: true,
          }
        )}
      />

      {state.value !== '' && (
        <button
          aria-label="close"
          className="relative flex h-5 w-5 items-center justify-center self-center"
          type="button"
          {...buttonProps}
        >
          <Icon icon={CLOSE_SVG} className="inline-block h-2 w-2" />
        </button>
      )}
    </div>
  );
};

export default Search;
