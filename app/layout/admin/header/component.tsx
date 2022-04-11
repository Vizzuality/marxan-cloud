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
    <div className="my-10 space-y-3">
      <Link
        href={backToHref || '/admin'}
      >
        <a href={backToHref || '/admin'} className="inline-flex items-center space-x-2 group">
          <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 border border-gray-200 rounded-full group-hover:border-gray-700">
            <Icon icon={ARROW_LEFT_SVG} className="relative w-3 h-3 -left-px" />
          </div>
          <div className="flex-grow group-hover:underline">
            {backToName || 'Back to Admin Panel'}
          </div>
        </a>
      </Link>
      <h2 className="text-5xl font-medium font-heading">{title}</h2>
    </div>
  );
};

export default AdminHeader;
