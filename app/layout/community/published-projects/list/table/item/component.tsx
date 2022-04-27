import React from 'react';

import Link from 'next/link';

// import { format } from 'd3';

import DuplicateButton from 'layout/community/published-projects/list/table/duplicate-button/component';
import ComingSoon from 'layout/help/coming-soon';

export interface PublishedItemProps {
  id: string;
  name: string;
  description: string;
  creators: Record<string, any>[];
  resources?: Record<string, any>[];
  company?: Record<string, any>;
  pngData: string;
  location: string;
}
export const PublishedItem: React.FC<PublishedItemProps> = ({
  id,
  name,
  description,
  company,
  pngData,
  location,
}: PublishedItemProps) => {
  return (
    <tr key={id} className="border-b border-white border-opacity-20 last:border-transparent">
      <td className="pr-16 py-5">
        <div className="w-24 h-24 bg-primary-200 rounded-xl overflow-hidden">
          {pngData && (
            <img src={`data:image/png;base64,${pngData}`} alt={name} />
          )}
        </div>
      </td>

      <td className="pr-16 py-5">
        <Link href={`/community/projects/${id}`}>
          <a href={`/community/projects/${id}`} className="pb-1 font-semibold hover:underline">{name}</a>
        </Link>
        <p className="text-sm leading-normal text-gray-400 clamp-2">{description}</p>
      </td>

      <td className="pr-16 py-5">
        <div className="w-28">
          {!!company && (
            <img src={company.logoDataUrl} alt={company.name} className="max-w-full" />
          )}
        </div>
      </td>

      <td className="pr-16 text-sm w-28">
        <div className="w-28">
          <p className="text-sm">{location}</p>
        </div>
      </td>

      <td className="">
        <div className="flex flex-row justify-between">
          {/*
            <p className="w-6 text-sm">
              {timesDuplicated && (format('.3s')(timesDuplicated))}
            </p>
          */}
          <ComingSoon theme="dark">
            <DuplicateButton
              id={id}
              name={name}
            />
          </ComingSoon>
        </div>
      </td>
    </tr>
  );
};

export default PublishedItem;
