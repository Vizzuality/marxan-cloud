import { ComponentProps, PropsWithChildren, useState } from 'react';

import { HiChevronDown, HiChevronUp } from 'react-icons/hi';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from 'components/collapsible';
import { cn } from 'utils/cn';

const ICON_COMMON_CLASSES =
  'text-white group-data-[state=open]:text-blue-400 group-data-[disabled]:hidden';

const LegendGroup = ({
  title,
  children,
  defaultOpen = true,
  className,
  disabled = false,
  ...props
}: PropsWithChildren<
  ComponentProps<typeof Collapsible> & {
    title: string;
  }
>): JSX.Element => {
  const [isOpen, setOpen] = useState(defaultOpen && !disabled);

  return (
    <Collapsible
      defaultOpen={defaultOpen && !disabled}
      onOpenChange={setOpen}
      className={cn({
        group: true,
        [className]: Boolean(className),
      })}
      disabled={disabled}
      {...props}
    >
      <CollapsibleTrigger className="py-2">
        <header
          className={cn({
            'flex items-center space-x-1': true,
            'group-data-[disabled]:pl-4': true,
          })}
        >
          {isOpen ? (
            <HiChevronUp className={ICON_COMMON_CLASSES} />
          ) : (
            <HiChevronDown className={ICON_COMMON_CLASSES} />
          )}
          <h4 className="text-sm font-semibold group-data-[disabled]:text-gray-300 group-data-[state=open]:text-blue-400">
            {title}
          </h4>
        </header>
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
};

export default LegendGroup;
