import React from 'react';

import Link from 'next/link';

import Icon from 'components/icon';

import ARROW_LEFT_SVG from 'svgs/ui/arrow-left.svg?sprite';

export interface BacklinkProps {
  href?: string;
  children: React.ReactNode;
}

export const Backlink: React.FC<BacklinkProps> = ({ href, children }: BacklinkProps) => {
  return (
    <Link
      href={href}
      className="fle-row inline-flex cursor-pointer items-center transition-opacity hover:opacity-60"
    >
      <Icon icon={ARROW_LEFT_SVG} className="mr-1 h-3 w-3 text-black" />
      <h1 className="max-w-3xl font-heading text-lg font-semibold text-black underline ">
        {children}
      </h1>
    </Link>
  );
};

export default Backlink;
