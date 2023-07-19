import { PropsWithChildren, useCallback, useState } from 'react';

import Icon from 'components/icon';
import { cn } from 'utils/cn';

import ARROW_RIGHT_SVG from 'svgs/ui/arrow-right.svg?sprite';

export const Sidebar = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>): JSX.Element => {
  const [isOpen, setSidebar] = useState(true);

  const handleSidebar = useCallback(() => {
    setSidebar((prevState) => !prevState);
  }, []);

  return (
    <aside
      className={cn({
        'absolute z-20 flex h-full w-[550px] rounded-r-2xl bg-black  transition-transform': true,
        '-translate-x-full': !isOpen,
        [className]: !!className,
      })}
    >
      <div className="overflow-hidden px-8 py-6">{children}</div>
      <button
        type="button"
        onClick={handleSidebar}
        className={cn({
          'absolute left-full top-6 z-20 -translate-x-1/2 rounded-lg bg-black px-2 py-3': true,
          'translate-x-3': !isOpen,
        })}
      >
        <Icon
          icon={ARROW_RIGHT_SVG}
          className={cn({
            'h-3 w-3 transition-transform': true,
            'rotate-180': isOpen,
          })}
        />
      </button>
    </aside>
  );
};

export default Sidebar;
