import React from 'react';

import Link from 'next/link';

import { format } from 'd3';
import type { Project } from 'types/project-model';

import DuplicateButton from 'layout/community/published-projects/duplicate-button/component';

export interface PublishedItemProps extends Project {
  timesDuplicated?: number;
}
export const PublishedItem: React.FC<PublishedItemProps> = ({
  id,
  name,
  description,
  area,
  // contributors = [],
  timesDuplicated,
}: PublishedItemProps) => {
  return (
    <tr key={id} className="border-b border-white border-opacity-20 last:border-transparent">
      <td className="pr-6 py-7">
        <Link href={`/community/projects/${id}`}>
          <a href={`/community/projects/${id}`} className="pb-1 font-semibold hover:underline">{name}</a>
        </Link>
        <p className="text-sm leading-normal text-gray-400 clamp-2">{description}</p>
      </td>

      <td className="pr-6">
        <p className="text-sm">{area}</p>
      </td>
      <td className="pr-6">
        {/* {!!contributors.length && contributors?.map((c) =>
          <p key={`${c.id}`} className="text-sm">{c.name}</p>)} */}
      </td>
      <td className="">
        <div className="flex flex-row justify-between pl-10">
          <p className="w-6 text-sm">{timesDuplicated && (format('.3s')(timesDuplicated))}</p>
          <DuplicateButton
            id={id}
            name={name}
          />
        </div>
      </td>
    </tr>
  );
};

export default PublishedItem;
