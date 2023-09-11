import React, { useMemo, Children, isValidElement, PropsWithChildren } from 'react';

import { ScrollArea } from 'components/scroll-area';
import { cn } from 'utils/cn';

import SortableList from './sortable/list';

export const Legend = ({
  open,
  children,
  className = '',
  sortable,
  onChangeOrder,
}: PropsWithChildren<{
  open: boolean;
  className?: string;
  sortable?: {
    enabled: boolean;
    handle: boolean;
    handleIcon: React.ReactNode;
  };
  onChangeOrder?: (id: string[]) => void;
  onChangeOpen?: (open: boolean) => void;
}>): JSX.Element => {
  const isChildren = useMemo(() => {
    return !!Children.count(Children.toArray(children).filter((c) => isValidElement(c)));
  }, [children]);

  return (
    <div
      className={cn({
        'flex flex-col': true,
        hidden: !isChildren,
        [className]: !!className,
      })}
    >
      {open && (
        <ScrollArea className="relative flex w-full flex-col rounded-3xl bg-black px-2 py-2 before:pointer-events-none before:absolute before:left-0 before:top-0 before:z-10 before:h-6 before:w-full before:bg-gradient-to-b before:from-black before:via-black after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:z-10 after:h-6 after:w-full after:bg-gradient-to-t after:from-black after:via-black">
          <div className="divide-y divide-gray-600 divide-opacity-50 py-2">
            {!!sortable && (
              <SortableList sortable={sortable} onChangeOrder={onChangeOrder}>
                {children}
              </SortableList>
            )}

            {!sortable && children}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default Legend;
