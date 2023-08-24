import { useCallback } from 'react';

import { ArrowDown, ArrowUp } from 'lucide-react';

import { cn } from 'utils/cn';

import { HeaderItem } from './types';

const HeaderItem = ({
  className,
  text,
  name,
  columns,
  sorting,
  onClick,
}: HeaderItem): JSX.Element => {
  const sortingMatches = /^(-?)(.+)$/.exec(sorting);
  const sortField = sortingMatches[2];
  const sortOrder = sortingMatches[1] === '-' ? 'desc' : 'asc';

  const isActive = columns[name] === sortField;

  const handleClick = useCallback(() => {
    onClick(columns[name]);
  }, [onClick, columns, name]);

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
        <ArrowDown className={isActive ? 'text-blue-400' : 'text-gray-400'} size={20} />
      ) : (
        <ArrowUp className={isActive ? 'text-blue-400' : 'text-gray-400'} size={20} />
      )}
    </button>
  );
};

export default HeaderItem;
