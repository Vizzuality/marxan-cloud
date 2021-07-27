import React, { useCallback } from 'react';

import { Form as FormRFF } from 'react-final-form';

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

  const handleDuplicateProjectSubmit = useCallback(() => {
    duplicateProjectMutation.mutate({ id }, {
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

        console.info('Project name saved succesfully', s);
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

        console.error('Project name not saved');
      },
    });
  }, [id, addToast, duplicateProjectMutation, name]);

  return (

    <FormRFF onSubmit={handleDuplicateProjectSubmit}>
      {({ handleSubmit }) => (
        <form
          id="form-duplicate-project"
          onSubmit={handleSubmit}
          autoComplete="off"
          className="relative max-w-xs px-2"
        >
          <Button
            className="px-6 group"
            size="s"
            theme="transparent-white"
            type="submit"
          >
            Duplicate

            <Icon
              className="w-3.5 h-3.5 ml-2 text-white group-hover:text-black"
              icon={DOWNLOAD_SVG}
            />
          </Button>
        </form>
      )}
    </FormRFF>
  );
};

export default DuplicateButton;
