import { PropsWithChildren, isValidElement } from 'react';

import { cn } from 'utils/cn';
export const NoResults = ({
  message = 'No results found',
  children,
  className,
}: PropsWithChildren<{ message?: string; className?: string }>): JSX.Element => {
  return (
    <div
      className={cn({
        'flex min-h-[160px] w-full items-center justify-center': true,
        [className]: !!className,
      })}
    >
      {isValidElement(children) ? children : <span className="text-sm uppercase">{message}</span>}
    </div>
  );
};

export default NoResults;
