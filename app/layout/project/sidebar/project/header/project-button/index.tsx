import Icon from 'components/icon/component';
import { Popover, PopoverContent, PopoverTrigger } from 'components/popover';
import { cn } from 'utils/cn';

import DOTS_SVG from 'svgs/ui/dots.svg?sprite';

const ProjectButton = (): JSX.Element => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-400 hover:border-white">
          <Icon
            icon={DOTS_SVG}
            className={cn({
              'h-4 w-4 text-white': true,
            })}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="left"
        sideOffset={20}
        className="w-32 rounded-2xl bg-gray-700 p-2 font-sans text-xs"
        collisionPadding={48}
        // onInteractOutside={() => toggleSubmenu('user')}
      >
        {/* <UserMenu /> */}
        <p>Publish Project</p>
        <p>Download Project</p>
      </PopoverContent>
    </Popover>
  );
};

export default ProjectButton;
