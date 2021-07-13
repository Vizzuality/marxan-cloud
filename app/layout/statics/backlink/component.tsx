import React from 'react';

import Link from 'next/link';

import Icon from 'components/icon';

import ARROW_LEFT_SVG from 'svgs/ui/arrow-left.svg?sprite';

export interface BacklinkProps {
  href?: string,
  children: React.ReactNode,
}

export const Backlink: React.FC<BacklinkProps> = ({
  href,
  children,
}: BacklinkProps) => {
  return (
    <Link href={href}>
      <div className="flex items-center cursor-pointer fle-row">
        <Icon icon={ARROW_LEFT_SVG} className="w-3 h-3 mr-1 text-blue-500" />
        <h1 className="max-w-3xl text-lg font-semibold text-blue-500 font-heading hover:underline">
          {children}
        </h1>
      </div>
    </Link>
  );
};

export default Backlink;
