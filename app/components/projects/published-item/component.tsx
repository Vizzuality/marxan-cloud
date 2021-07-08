import React from 'react';

import Link from 'next/link';

import { format } from 'd3';

import Button from 'components/button';
import Icon from 'components/icon';

import type { Project } from 'types/project-model';

import DOWNLOAD_SVG from 'svgs/ui/download.svg?sprite';

export interface PublishedItemProps extends Project {
  timesDuplicated?: number;
}

export const Item: React.FC<PublishedItemProps> = ({
  id,
  name,
  description,
  area,
  contributors = [],
  timesDuplicated,
}: PublishedItemProps) => {
  return (
    <tr key={id} className="flex flex-row items-center border-b border-white cursor-pointer border-opacity-20">
      <Link href={`/community/projects/${id}`} prefetch={false}>
        <td className="pr-6 py-7 w-96">
          <p className="pb-1 font-semibold hover:underline">{name}</p>
          <p className="text-base leading-normal text-gray-400 clamp-2">{description}</p>
        </td>
      </Link>
      <td className="w-44">
        <p className="text-sm">{area}</p>
      </td>
      <td className="w-44">
        {!!contributors.length && contributors?.map((c) => <p key={`${c.id}`} className="text-sm">{c.name}</p>)}
      </td>
      <td className="items-center w-72">
        <div className="flex flex-row justify-between pl-10">
          <p className="w-6 text-sm">{timesDuplicated && (format('.3s')(timesDuplicated))}</p>
          <Button size="s" theme="transparent-white" className="px-6 group">
            Duplicate
            <Icon icon={DOWNLOAD_SVG} className="w-3.5 h-3.5 ml-2 text-white group-hover:text-black" />
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default Item;
