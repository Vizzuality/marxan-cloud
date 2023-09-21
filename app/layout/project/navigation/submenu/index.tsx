import Link from 'next/link';

import Icon, { IconProps } from 'components/icon';
import Tooltip from 'components/tooltip';
import { cn } from 'utils/cn';

import { MenuTooltip, TOOLTIP_OFFSET } from '../';

export interface SubMenuItem {
  name: string;
  icon: IconProps['icon'];
  route: string;
  selected: boolean;
}

export const SubMenu = ({ items }: { items: SubMenuItem[] }): JSX.Element => {
  return (
    <ul className="space-y-5 rounded-xl border border-gray-600 py-4">
      {items.map((item) => (
        <Tooltip
          key={item.route}
          placement="right"
          offset={TOOLTIP_OFFSET}
          content={<MenuTooltip>{item.name}</MenuTooltip>}
        >
          <li className="group">
            <Link
              href={item.route}
              className={cn({
                'flex px-[10px]': true,
                'relative overflow-hidden before:absolute before:-left-[1px] before:block before:h-full before:w-[3px] before:rounded-sm before:bg-blue-500 before:drop-shadow-blue after:absolute after:-right-[1px] after:block after:h-full after:w-[3px] after:rounded-sm after:bg-blue-500 after:drop-shadow-blue':
                  item.selected,
              })}
            >
              <Icon
                icon={item.icon}
                className={cn({
                  'h-5 w-5 group-hover:text-primary-400': true,
                  'text-primary-400': item.selected,
                })}
              />
            </Link>
          </li>
        </Tooltip>
      ))}
    </ul>
  );
};

export default SubMenu;
