import React from 'react';

import Icon from 'components/icon';
import Link from 'next/link';

import ARROW_RIGHT_2_SVG from 'svgs/ui/arrow-right-2.svg?sprite';

export interface StaticButtonLinkProps {
  caption: string;
  href: string;
  external?: boolean;
}

export const StaticButtonLink: React.FC<StaticButtonLinkProps> = ({
  caption,
  href,
  external = false,
}: StaticButtonLinkProps) => {
  const children = (
    <>
      <p className="mr-4 text-lg text-primary-500">{caption}</p>
      <div className="flex items-center justify-center bg-transparent border rounded-full h-7 w-7 border-primary-500">
        <Icon icon={ARROW_RIGHT_2_SVG} className="w-3 h-3 text-primary-500" />
      </div>
    </>
  );

  return (
    <>
      {external && (
        <a className="flex flex-row items-center cursor-pointer" href={href} rel="noopener noreferrer" target="_blank">
          {children}
        </a>
      )}
      {!external && (
        <Link href={href}>
          <div className="flex flex-row items-center cursor-pointer">
            {children}
          </div>
        </Link>
      )}
    </>
  );
};

export default StaticButtonLink;
