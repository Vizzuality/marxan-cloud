import React from 'react';

import Link from 'next/link';

import Icon from 'components/icon';

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
      <p className="w-48 mr-4 text-lg text-gray-600 hover:text-gray-800 underline">{caption}</p>
      <div className="flex items-center justify-center bg-transparent border rounded-full h-7 w-7 border-gray-600 hover:border-gray-800">
        <Icon icon={ARROW_RIGHT_2_SVG} className="w-3 h-3 text-gray-600" />
      </div>
    </>
  );

  return (
    <>
      {external && (
        <a className="flex flex-row items-center justify-between w-full cursor-pointer" href={href} rel="noopener noreferrer" target="_blank">
          {children}
        </a>
      )}
      {!external && (
        <Link href={href}>
          <div className="flex flex-row items-center justify-between w-full cursor-pointer">
            {children}
          </div>
        </Link>
      )}
    </>
  );
};

export default StaticButtonLink;
