import { PropsWithChildren, useCallback } from 'react';

import { useAppSelector, useAppDispatch } from 'store/hooks';
import { setSidebarVisibility } from 'store/slices/projects/[id]';

import Icon from 'components/icon';
import { cn } from 'utils/cn';

import ARROW_RIGHT_SVG from 'svgs/ui/arrow-right.svg?sprite';

export const Sidebar = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>): JSX.Element => {
  const { isSidebarOpen } = useAppSelector((state) => state['/projects/[id]']);
  const dispatch = useAppDispatch();

  const handleSidebar = useCallback(() => {
    dispatch(setSidebarVisibility(!isSidebarOpen));
  }, [isSidebarOpen]);

  return (
    <aside
      className={cn({
        'absolute z-20 flex h-full w-[550px] rounded-r-2xl bg-black transition-transform': true,
        '-translate-x-full': !isSidebarOpen,
        [className]: !!className,
      })}
    >
      <div className="overflow-hidden px-8 py-6">{children}</div>
      <button
        type="button"
        onClick={handleSidebar}
        className={cn({
          'absolute left-full top-6 z-20 -translate-x-1/2 rounded-lg bg-black px-2 py-3': true,
          'translate-x-3': !isSidebarOpen,
        })}
      >
        <Icon
          icon={ARROW_RIGHT_SVG}
          className={cn({
            'h-3 w-3 transition-transform': true,
            'rotate-180': isSidebarOpen,
          })}
        />
      </button>
    </aside>
  );
};

export default Sidebar;
