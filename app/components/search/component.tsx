import React, { InputHTMLAttributes } from 'react';
import cx from 'classnames';
import Icon from 'components/icon';
import SEARCH_SVG from 'svgs/ui/search.svg';

const THEME = {
  dark: 'text-white',
  light: 'text-black',
};

const SIZES = {
  sm: 'text-sm',
  base: 'text-base',
};

export interface SearchProps extends InputHTMLAttributes<HTMLInputElement> {
  theme?: 'dark' | 'light';
  sizes: 'sm' | 'base';
  text?: string;
}

export const Search: React.FC<SearchProps> = ({
  theme = 'dark',
  sizes = 'base',
  text,
  className,
  onChange,
  ...props
}: SearchProps) => {
  return (
    <div
      className={cx(
        'flex w-full relative border-b border-gray-400 p-4',
        { [THEME[theme]]: true },
        { [SIZES[sizes]]: true },
      )}
    >
      <Icon
        icon={SEARCH_SVG}
        className="absolute top-1 left-1 w-4.5 h-4.5 fill-current"
      />
      <input
        {...props}
        placeholder={text}
        type="text"
        className={cx(
          'absolute top-1 left-9 bg-transparent truncate focus:outline-none leading-4 placeholder-gray-300 placeholder-opacity-50',
          { [THEME[theme]]: true },
        )}
        onChange={onChange}
      />
    </div>
  );
};

export default Search;
