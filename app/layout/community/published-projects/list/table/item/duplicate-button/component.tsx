import React, { ComponentProps, useCallback, useState } from 'react';

import { usePlausible } from 'next-plausible';

import { useMe } from 'hooks/me';
import { useDuplicatePublishedProject } from 'hooks/published-projects';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import Icon from 'components/icon';
import Loading from 'components/loading';
import Tooltip from 'components/tooltip';
import { cn } from 'utils/cn';

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
  const { data: user } = useMe();
  const [duplicating, setDuplicating] = useState(false);

  const { addToast } = useToasts();
  const plausible = usePlausible();

  const duplicateProjectMutation = useDuplicatePublishedProject({
    requestConfig: {
      method: 'POST',
    },
  });

  const onDuplicate = useCallback(() => {
    setDuplicating(true);
    // Name must be the new one defined by the user
    duplicateProjectMutation.mutate(
      { exportId },
      {
        onSuccess: ({ data: { data: s } }) => {
          setDuplicating(false);
          addToast(
            'success-duplicate-project',
            <>
              <h2 className="font-medium">Success!</h2>
              <p className="text-sm">Project {name} duplicated</p>
            </>,
            {
              level: 'success',
            }
          );

          console.info('Project duplicated succesfully', s);

          plausible('Duplicate public project', {
            props: {
              userId: `${user.id}`,
              userEmail: `${user.email}`,
              projectName: `${name}`,
            },
          });
        },
        onError: () => {
          setDuplicating(false);
          addToast(
            'error-duplicate-project',
            <>
              <h2 className="font-medium">Error!</h2>
              <p className="text-sm">Project {name} not duplicated</p>
            </>,
            {
              level: 'error',
            }
          );

          console.error('Project not duplicated');
        },
      }
    );
  }, [exportId, addToast, duplicateProjectMutation, name, plausible, user?.email, user?.id]);

  return (
    <Tooltip
      disabled={Boolean(user)}
      arrow
      placement="top"
      content={
        <div
          className="rounded bg-white p-4 text-xs text-gray-600"
          style={{
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            maxWidth: 200,
          }}
        >
          You should sign in to be able to duplicate the project
        </div>
      }
    >
      <div>
        <Button
          className="group px-6"
          size="s"
          disabled={duplicating || !user}
          theme={
            cn({
              'transparent-white': theme === 'light',
              'transparent-black': theme !== 'light',
            }) as ComponentProps<typeof Button>['theme']
          }
          onClick={onDuplicate}
        >
          <Loading
            visible={duplicating}
            className="absolute bottom-0 left-0 right-0 top-0 z-40 flex h-full w-full items-center justify-center"
            iconClassName="w-10 h-10 text-white"
          />
          Duplicate
          <Icon
            className={cn({
              'ml-2 h-3.5 w-3.5': true,
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
