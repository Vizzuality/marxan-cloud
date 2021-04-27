import React, { ButtonHTMLAttributes } from 'react';
import cx from 'classnames';

import Icon from 'components/icon';
import ARROW_LEFT_SVG from 'svgs/ui/arrow-left.svg?sprite';
import FOLDER_SVG from 'svgs/ui/folder.svg?sprite';

export interface BreadcrumProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void | unknown;
}

export const Breadcrum: React.FC<BreadcrumProps> = ({
  children,
  className,
  onClick,
}: BreadcrumProps) => (
  <button
    type="button"
    className={cx({
      'flex items-center text-sm text-primary-500 hover:text-primary-300 focus:outline-none h-6': true,
      [className]: !!className,
    })}
    onClick={onClick}
  >
    <Icon className="w-3 h-3" icon={ARROW_LEFT_SVG} />
    <Icon className="w-5 h-5 ml-1" icon={FOLDER_SVG} />
    <div className="ml-3">{children}</div>
  </button>
);

export default Breadcrum;
