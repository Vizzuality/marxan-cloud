import React from 'react';

import Link from 'next/link';

import { format } from 'd3';
import type { Project } from 'types/project-model';

import { useProjectUsers } from 'hooks/project-users';

import DuplicateButton from 'layout/community/published-projects/duplicate-button/component';
import ComingSoon from 'layout/help/coming-soon';

export interface PublishedItemProps extends Project {
  timesDuplicated?: number;
}
export const PublishedItem: React.FC<PublishedItemProps> = ({
  id,
  name,
  description,
  area,
  timesDuplicated,
}: PublishedItemProps) => {
  const planningArea = area || 'Custom';

  const { data: projectUsers } = useProjectUsers(id);
  const projectUsersVisibleSize = 3;
  const projectUsersVisible = projectUsers?.slice(0, projectUsersVisibleSize);

  return (
    <tr key={id} className="border-b border-white border-opacity-20 last:border-transparent">
      <td className="pr-6 py-7">
        <Link href={`/community/projects/${id}`}>
          <a href={`/community/projects/${id}`} className="pb-1 font-semibold hover:underline">{name}</a>
        </Link>
        <p className="text-sm leading-normal text-gray-400 clamp-2">{description}</p>
      </td>

      <td className="pr-6">
        <p className="text-sm">{planningArea}</p>
      </td>
      <td className="pr-6 text-sm">
        {!!projectUsersVisible?.length && projectUsersVisible?.map((u) => <p key={`${u.user.id}`}>{u.user.displayName}</p>)}
        {projectUsers?.length > projectUsersVisibleSize && (
          <p>
            {`(+${projectUsers.length - projectUsersVisibleSize})`}
          </p>
        )}
      </td>
      <td className="">
        <div className="flex flex-row justify-between pl-10">
          <p className="w-6 text-sm">{timesDuplicated && (format('~s')(timesDuplicated))}</p>
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
