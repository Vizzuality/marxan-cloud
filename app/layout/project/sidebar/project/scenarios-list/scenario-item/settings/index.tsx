import React, { ReactNode } from 'react';

import { useRouter } from 'next/router';

import { useCanEditProject } from 'hooks/permissions';

import Button from 'components/button';

export interface ScenarioSettingsProps {
  children: ReactNode;
  onDelete?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onDuplicate?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export const ScenarioSettings: React.FC<ScenarioSettingsProps> = ({
  children,
  onDelete,
  onDuplicate,
}: ScenarioSettingsProps) => {
  const { query } = useRouter();
  const { pid } = query as { pid: string };

  const editable = useCanEditProject(pid);

  return (
    <div className="w-full rounded-b-3xl bg-gray-700 px-8 pb-4 pt-6">
      {children}

      <div className="mt-2.5 flex w-full justify-end space-x-1">
        <Button
          className="flex-shrink-0"
          size="s"
          theme="secondary"
          disabled={!editable}
          onClick={onDuplicate}
        >
          Duplicate
        </Button>

        <Button
          className="flex-shrink-0"
          size="s"
          theme="secondary"
          disabled={!editable}
          onClick={onDelete}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default ScenarioSettings;
