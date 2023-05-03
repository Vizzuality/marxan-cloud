import React, { ButtonHTMLAttributes } from 'react';

import cx from 'classnames';

import Icon from 'components/icon';

import ARROW_LEFT_SVG from 'svgs/ui/arrow-left.svg?sprite';
import FOLDER_SVG from 'svgs/ui/folder.svg?sprite';

export interface BreadcrumProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void | unknown;
}

export const Breadcrum: React.FC<BreadcrumProps> = ({
  children,
  className,
  onClick,
}: BreadcrumProps) => (
  <div className="inline-flex">
    <button
      type="button"
      className={cx({
        'flex h-6 items-center overflow-hidden text-sm text-primary-500 hover:text-primary-300 focus:outline-none':
          true,
        [className]: !!className,
      })}
      onClick={onClick}
    >
      <Icon className="h-3 w-3 flex-shrink-0" icon={ARROW_LEFT_SVG} />
      <Icon className="ml-1 h-5 w-5 flex-shrink-0" icon={FOLDER_SVG} />
      <div className="ml-3 overflow-hidden overflow-ellipsis whitespace-nowrap">{children}</div>
    </button>
  </div>
);

export default Breadcrum;
