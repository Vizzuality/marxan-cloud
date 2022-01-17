import React, { ReactNode } from 'react';

import { useRouter } from 'next/router';

import { useRoleMe } from 'hooks/project-users';

import ComingSoon from 'layout/help/coming-soon';

import Button from 'components/button';

export interface ItemSettingsProps {
  children: ReactNode;
  onDelete?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onDuplicate?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export const Item: React.FC<ItemSettingsProps> = ({
  children,
  onDelete,
  onDuplicate,
}: ItemSettingsProps) => {
  const { query } = useRouter();
  const { pid } = query;
  const { data: roleMe } = useRoleMe(pid);
  const VIEWER = roleMe === 'project_viewer';

  return (
    <div className="w-full px-8 pt-6 pb-4 bg-gray-700 rounded-b-3xl">
      {children}

      <div className="flex justify-end w-full space-x-1 mt-2.5">
        <ComingSoon>
          <Button
            className="flex-shrink-0"
            size="s"
            theme="secondary"
            disabled={VIEWER}
            onClick={onDuplicate}
          >
            Duplicate
          </Button>
        </ComingSoon>

        <Button
          className="flex-shrink-0"
          size="s"
          theme="secondary"
          disabled={VIEWER}
          onClick={onDelete}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default Item;
