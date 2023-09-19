import { useCallback } from 'react';

import { HiArrowUp, HiArrowDown } from 'react-icons/hi';

import { cn } from 'utils/cn';

import { HeaderItem } from './types';

const HeaderItem = ({ className, text, name, sorting, onClick }: HeaderItem): JSX.Element => {
  const sortingMatches = /^(-?)(.+)$/.exec(sorting);
  const sortField = sortingMatches[2];
  const sortOrder = sortingMatches[1] === '-' ? 'desc' : 'asc';

  const isActive = name === sortField;

  const handleClick = useCallback(() => {
    onClick(name);
  }, [onClick, name]);

  return (
    <button
      type="button"
      className={cn({
        'inline-flex items-center space-x-2': true,
        [className]: !!className,
      })}
      onClick={handleClick}
    >
      <span
        className={cn({
          'text-xs font-semibold uppercase leading-none text-gray-400': true,
          'text-white': isActive,
          [className]: !!className,
        })}
      >
        {text}
      </span>
      {sortOrder === 'asc' && isActive ? (
        <HiArrowDown
          className={cn({
            'h-5 w-5 text-gray-400': true,
            'text-blue-400': isActive,
          })}
        />
      ) : (
        <HiArrowUp
          className={cn({
            'h-5 w-5 text-gray-400': true,
            'text-blue-400': isActive,
          })}
        />
      )}
    </button>
  );
};

export default HeaderItem;
