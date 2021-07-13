import React from 'react';

import Icon from 'components/icon';

import ARROW_RIGHT_2_SVG from 'svgs/ui/arrow-right-2.svg?sprite';

export interface StaticButtonLinkProps {
  caption: string,
  href: string,
}

export const StaticButtonLink: React.FC<StaticButtonLinkProps> = ({
  caption,
  href,
}: StaticButtonLinkProps) => {
  return (
    <a className="flex flex-row items-start w-full" href={href}>
      <div className="w-44">
        <p className="mr-4 text-lg text-primary-500">{caption}</p>
      </div>
      <div className="flex items-center justify-center bg-transparent border rounded-full h-7 w-7 border-primary-500">
        <Icon icon={ARROW_RIGHT_2_SVG} className="w-3 h-3 text-primary-500" />
      </div>
    </a>
  );
};

export default StaticButtonLink;
