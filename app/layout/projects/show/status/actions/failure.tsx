import React, { useCallback } from 'react';

import { useQueryClient } from 'react-query';

import { useRouter } from 'next/router';

import { useSaveProject } from 'hooks/projects';
import { useToasts } from 'hooks/toast';

export const useProjectActionsFailure = () => {
  const { query } = useRouter();
  const { pid } = query as { pid: string };
  const queryClient = useQueryClient();

  const projectMutation = useSaveProject({
    requestConfig: {
      method: 'PATCH',
    },
  });

  const onSuccess = useCallback(async () => {
    await queryClient.invalidateQueries(['project', pid]);
  }, [queryClient, pid]);

  const { addToast } = useToasts();

  const onFailure = useCallback(() => {
    projectMutation.mutate(
      {
        id: pid,
        data: {
          metadata: {
            cache: new Date().getTime(),
          },
        },
      },
      {
        onSuccess,
        onError: () => {
          addToast(
            'onFailure',
            <>
              <h2 className="font-medium">Error!</h2>
            </>,
            {
              level: 'error',
            }
          );
        },
      }
    );
  }, [pid, projectMutation, addToast, onSuccess]);

  const onFailureDownloadProject = useCallback(() => {
    projectMutation.mutate(
      {
        id: pid,
        data: {
          metadata: {
            cache: new Date().getTime(),
          },
        },
      },
      {
        onSuccess,
        onError: () => {
          addToast(
            'onFailureDownloadProject',
            <>
              <h2 className="font-medium">Error!</h2>
            </>,
            {
              level: 'error',
            }
          );
        },
      }
    );
  }, [pid, projectMutation, addToast, onSuccess]);

  const onFailureCostSurface = useCallback(() => {
    projectMutation.mutate(
      {
        id: pid,
        data: {
          metadata: {
            cache: new Date().getTime(),
          },
        },
      },
      {
        onSuccess,
        onError: () => {
          addToast(
            'onFailureCostSurface',
            <>
              <h2 className="font-medium">There was an error processing the cost surface.</h2>
            </>,
            {
              level: 'error',
            }
          );
        },
      }
    );
  }, [pid, projectMutation, addToast, onSuccess]);

  return {
    default: onFailure,
    planningUnits: onFailure,
    export: onFailureDownloadProject,
    costSurface: onFailureCostSurface,
  };
};
