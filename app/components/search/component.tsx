import React, { InputHTMLAttributes } from 'react';
import cx from 'classnames';
import Icon from 'components/icon';
import SEARCH_SVG from 'svgs/ui/search.svg';

const THEME = {
  primary: 'text-white',
  secondary: 'text-black',
};

export interface SearchProps extends InputHTMLAttributes<HTMLInputElement> {
  theme?: 'primary';
  text?: string;
}

export const Search: React.FC<SearchProps> = ({
  theme = 'primary',
  text,
  className,
  onChange,
  ...props
}: SearchProps) => {
  return (
    <div
      className={cx(
        'flex w-full relative border-b border-gray-400 text-base p-4',
        { [THEME[theme]]: true },
      )}
    >
      <Icon
        icon={SEARCH_SVG}
        className="absolute top-1 left-1 w-4 h-4 fill-current"
      />
      <input
        {...props}
        placeholder={text}
        type="text"
        className={cx(
          'absolute top-1 left-9 bg-transparent truncate focus:outline-none leading-4',
          {
            [className]: !!className,
          },
        )}
        onChange={onChange}
      />
    </div>
  );
};

export default Search;
