import React from 'react';

import PublishedItem from 'layout/community/published-projects/list/table/item';

import Icon from 'components/icon';

import ARROW_DOWN_SVG from 'svgs/ui/arrow-right-2.svg?sprite';

export interface CommunityProjectsTableProps {
  data: Record<string, any>[];
}

export const CommunityProjectsTable: React.FC<CommunityProjectsTableProps> = ({
  data,
}: CommunityProjectsTableProps) => {
  if (!data || !data.length) return null;

  return (
    <table className="w-full mt-10">
      <thead>
        <tr>
          <th className="py-2.5 pr-16 font-normal">
            <h4 className="text-sm text-left whitespace-nowrap">Location</h4>
          </th>
          <th className="py-2.5 pr-16 font-normal w-full">
            <h4 className="text-sm text-left whitespace-nowrap">Name</h4>
          </th>
          <th className="py-2.5 pr-16 font-normal">
            <h4 className="text-sm text-left whitespace-nowrap">Creator</h4>
          </th>
          <th className="py-2.5 pr-16 font-normal">
            <h4 className="text-sm text-left whitespace-nowrap">Location</h4>
          </th>
          <th className="py-2.5 font-normal">
            <div className="flex flex-row">
              <h4 className="text-sm text-left whitespace-nowrap">Copy to my account</h4>
              <Icon icon={ARROW_DOWN_SVG} className="w-3.5 h-3.5 ml-2 text-white transform rotate-90" />
            </div>
          </th>
        </tr>
      </thead>

      <tbody>
        {data.map((pp) => {
          const {
            id: pid, name, description, creators, resources, company, pngData, location,
          } = pp;

          return (
            <PublishedItem
              key={pid}
              id={pid}
              name={name}
              description={description}
              creators={creators}
              resources={resources}
              company={company}
              pngData={pngData}
              location={location}
            />
          );
        })}
      </tbody>
    </table>
  );
};

export default CommunityProjectsTable;
