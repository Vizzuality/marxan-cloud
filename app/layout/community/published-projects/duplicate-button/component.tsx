import React, { useCallback } from 'react';

import { useDuplicateProject } from 'hooks/projects';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import Icon from 'components/icon';

import DOWNLOAD_SVG from 'svgs/ui/download.svg?sprite';

export interface DuplicateButtonProps {
  id: string;
  name: string;
}

export const DuplicateButton: React.FC<DuplicateButtonProps> = ({
  id,
  name,
}: DuplicateButtonProps) => {
  const { addToast } = useToasts();

  const duplicateProjectMutation = useDuplicateProject({
    requestConfig: {
      method: 'POST',
    },
  });

  const onDuplicate = useCallback(() => {
    // Name must be the new one defined by the user
    duplicateProjectMutation.mutate({ id, data: name }, {
      onSuccess: ({ data: { data: s } }) => {
        addToast('success-duplicate-project', (
          <>
            <h2 className="font-medium">Success!</h2>
            <p className="text-sm">
              Project
              {' '}
              {name}
              {' '}
              duplicated
            </p>
          </>
        ), {
          level: 'success',
        });

        console.info('Project duplicated succesfully', s);
      },
      onError: () => {
        addToast('error-duplicate-project', (
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">
              Project
              {' '}
              {name}
              {' '}
              not duplicated
            </p>
          </>
        ), {
          level: 'error',
        });

        console.error('Project not duplicated');
      },
    });
  }, [id, addToast, duplicateProjectMutation, name]);

  return (
    <Button
      className="px-6 group"
      size="s"
      theme="transparent-white"
      onClick={onDuplicate}
    >
      Duplicate
      <Icon
        className="w-3.5 h-3.5 ml-2 text-white group-hover:text-black"
        icon={DOWNLOAD_SVG}
      />
    </Button>
  );
};

export default DuplicateButton;
