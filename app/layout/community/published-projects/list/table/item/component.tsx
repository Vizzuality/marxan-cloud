import React from 'react';

import Link from 'next/link';

import DuplicateButton from 'layout/community/published-projects/list/table/item/duplicate-button';

export interface PublishedItemProps {
  id: string;
  name: string;
  description: string;
  creators: Record<string, any>[];
  resources?: Record<string, any>[];
  company?: Record<string, any>;
  pngData: string;
  location: string;
  exportId: string;
}
export const PublishedItem: React.FC<PublishedItemProps> = ({
  id,
  name,
  description,
  company,
  pngData,
  location,
  exportId,
}: PublishedItemProps) => {
  return (
    <tr key={id} className="border-b border-white border-opacity-20 last:border-transparent">
      <td className="py-5 pr-16">
        <div className="h-24 w-24 overflow-hidden rounded-xl bg-primary-200">
          {pngData && <img src={`data:image/png;base64,${pngData}`} alt={name} />}
        </div>
      </td>

      <td className="py-5 pr-16">
        <Link href={`/community/projects/${id}`} className="pb-1 font-semibold hover:underline">
          {name}
        </Link>
        <p className="line-clamp-2 text-sm leading-normal text-gray-900">{description}</p>
      </td>

      <td className="py-5 pr-16">
        <div className="w-28">
          {!!company && <img src={company.logoDataUrl} alt={company.name} className="max-w-full" />}
        </div>
      </td>

      <td className="w-28 pr-16 text-sm">
        <div className="w-28">
          <p className="text-sm">{location}</p>
        </div>
      </td>

      <td className="">
        <div className="flex flex-row justify-between">
          <DuplicateButton exportId={exportId} name={name} />
        </div>
      </td>
    </tr>
  );
};

export default PublishedItem;
