import React, { useCallback, useState } from 'react';

import classnames from 'classnames';

import { useMe } from 'hooks/me';
import { useDuplicatePublishedProject } from 'hooks/published-projects';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import Icon from 'components/icon';
import Loading from 'components/loading';
import Tooltip from 'components/tooltip';

import DOWNLOAD_SVG from 'svgs/ui/download.svg?sprite';

export interface DuplicateButtonProps {
  exportId: string;
  name: string;
  theme?: 'dark' | 'light';
}

export const DuplicateButton: React.FC<DuplicateButtonProps> = ({
  exportId,
  name,
  theme = 'dark',
}: DuplicateButtonProps) => {
  const { user } = useMe();
  const [duplicating, setDuplicating] = useState(false);
  const { addToast } = useToasts();

  const duplicateProjectMutation = useDuplicatePublishedProject({
    requestConfig: {
      method: 'POST',
    },
  });

  const onDuplicate = useCallback(() => {
    setDuplicating(true);
    // Name must be the new one defined by the user
    duplicateProjectMutation.mutate({ exportId }, {
      onSuccess: ({ data: { data: s } }) => {
        setDuplicating(false);
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
        setDuplicating(false);
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
  }, [exportId, addToast, duplicateProjectMutation, name]);

  return (
    <Tooltip
      disabled={user}
      arrow
      placement="top"
      content={(
        <div
          className="p-4 text-xs text-gray-500 bg-white rounded"
          style={{
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            maxWidth: 200,
          }}
        >
          You should sign in to be able to duplicate the project
        </div>
      )}
    >
      <div>
        <Button
          className="px-6 group"
          size="s"
          disabled={duplicating || !user}
          theme={classnames({
            'transparent-white': theme === 'light',
            'transparent-black': theme !== 'light',
          })}
          onClick={onDuplicate}
        >
          <Loading
            visible={duplicating}
            className="absolute top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center w-full h-full"
            iconClassName="w-10 h-10 text-white"
          />

          Duplicate
          <Icon
            className={classnames({
              'w-3.5 h-3.5 ml-2': true,
              'text-white group-hover:text-black': theme === 'light',
              'text-black group-hover:text-white': theme === 'dark',
            })}
            icon={DOWNLOAD_SVG}
          />
        </Button>
      </div>
    </Tooltip>
  );
};

export default DuplicateButton;
