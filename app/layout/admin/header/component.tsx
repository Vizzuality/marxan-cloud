import React from 'react';

import Link from 'next/link';

import Icon from 'components/icon';

import ARROW_LEFT_SVG from 'svgs/ui/arrow-left.svg?sprite';

export interface AdminHeaderProps {
  title: string;
  backToName?: string;
  backToHref?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  backToName,
  backToHref,
}: AdminHeaderProps) => {
  return (
    <div className="mb-3 mt-10 space-y-5">
      <Link href={backToHref || '/admin'} className="group inline-flex items-center space-x-2">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-gray-300 group-hover:border-gray-800">
          <Icon icon={ARROW_LEFT_SVG} className="relative -left-px h-3 w-3" />
        </div>
        <div className="flex-grow group-hover:underline">{backToName || 'Back to Admin Panel'}</div>
      </Link>
      <h2 className="font-heading text-5xl font-medium">{title}</h2>
    </div>
  );
};

export default AdminHeader;
