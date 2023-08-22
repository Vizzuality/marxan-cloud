import { ArrowDown, ArrowUp } from 'lucide-react';

import { cn } from 'utils/cn';

import { HeaderItem } from './types';

const HeaderItem = ({ className, text, name, columns, sorting, onClick }: HeaderItem) => {
  const sortingMatches = /^(-?)(.+)$/.exec(sorting);
  const sortField = sortingMatches[2];
  const sortOrder = sortingMatches[1] === '-' ? 'desc' : 'asc';

  const isActive = columns[name] === sortField;

  const handleClick = () => {
    onClick(columns[name]);
  };

  return (
    <button
      type="button"
      className={cn({
        'inline-flex w-full items-center space-x-2 pb-2 pt-5': true,
        [className]: true,
      })}
      onClick={handleClick}
    >
      <span
        className={cn({
          'text-xs font-semibold uppercase leading-none text-gray-400': true,
          'text-white': isActive,
          [className]: true,
        })}
      >
        {text}
      </span>
      {sortOrder === 'asc' ? (
        <ArrowDown className={isActive ? 'text-blue-400' : 'text-gray-400'} size={20} />
      ) : (
        <ArrowUp className={isActive ? 'text-blue-400' : 'text-gray-400'} size={20} />
      )}
    </button>
  );
};

export default HeaderItem;
