import { PropsWithChildren, HTMLAttributes } from 'react';

import { cn } from 'utils/cn';

const Section = ({
  children,
  className,
}: PropsWithChildren<{ className?: HTMLAttributes<HTMLElement>['className'] }>): JSX.Element => {
  return (
    <section
      className={cn({
        'space-y-2 rounded-[20px] bg-gray-800 p-6': true,
        [className]: Boolean(className),
      })}
    >
      {children}
    </section>
  );
};

export default Section;
