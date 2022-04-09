import React from 'react';

import { useSaveAdminPublishedProject } from 'hooks/admin';

import Select from 'components/forms/select';

export interface CellStatusProps {
  value: string,
  row: any,
}

export const CellStatus: React.FC<CellStatusProps> = ({
  value,
  row,
}: CellStatusProps) => {
  const adminPublishedProjectMutation = useSaveAdminPublishedProject({});

  if (!value) return null;

  return (
    <Select
      theme="light"
      size="s"
      initialSelected={value}
      options={[
        { label: 'Under moderation', value: 'under-moderation' },
        { label: 'Published', value: 'published' },
      ]}
      onChange={(v: string) => {
        switch (v) {
          case 'published': {
            adminPublishedProjectMutation.mutate({
              id: row.original.id,
              data: { alsoUnpublish: false },
              status: v,
            });
            break;
          }
          case 'under-moderation': {
            adminPublishedProjectMutation.mutate({
              id: row.original.id,
              status: v,
            });
            break;
          }
          default: {
            break;
          }
        }
      }}
    />
  );
};

export default CellStatus;
