import React from 'react';

import Icon from 'components/icon';
import PublishedItem from 'layout/community/published-projects/list/table/item';

import ARROW_DOWN_SVG from 'svgs/ui/arrow-right-2.svg?sprite';

export interface CommunityProjectsTableProps {
  data: Record<string, any>[];
}

export const CommunityProjectsTable: React.FC<CommunityProjectsTableProps> = ({
  data,
}: CommunityProjectsTableProps) => {
  if (!data || !data.length) return null;

  return (
    <table className="mt-10 w-full">
      <thead>
        <tr>
          <th className="py-2.5 pr-16 font-normal">
            <h4 className="whitespace-nowrap text-left text-sm">Location</h4>
          </th>
          <th className="w-full py-2.5 pr-16 font-normal">
            <h4 className="whitespace-nowrap text-left text-sm">Name</h4>
          </th>
          <th className="py-2.5 pr-16 font-normal">
            <h4 className="whitespace-nowrap text-left text-sm">Creator</h4>
          </th>
          <th className="py-2.5 pr-16 font-normal">
            <h4 className="whitespace-nowrap text-left text-sm">Location</h4>
          </th>
          <th className="py-2.5 font-normal">
            <div className="flex flex-row">
              <h4 className="whitespace-nowrap text-left text-sm">Copy to my account</h4>
              <Icon
                icon={ARROW_DOWN_SVG}
                className="ml-2 h-3.5 w-3.5 rotate-90 transform text-white"
              />
            </div>
          </th>
        </tr>
      </thead>

      <tbody>
        {data.map((pp) => {
          const {
            id: pid,
            name,
            description,
            creators,
            resources,
            company,
            pngData,
            location,
            exportId,
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
              exportId={exportId}
            />
          );
        })}
      </tbody>
    </table>
  );
};

export default CommunityProjectsTable;
