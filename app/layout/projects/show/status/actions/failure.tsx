import React, {
  useCallback,
} from 'react';

import { useRouter } from 'next/router';

import { useSaveProject } from 'hooks/projects';
import { useToasts } from 'hooks/toast';

export const useProjectActionsFailure = () => {
  const { query } = useRouter();
  const { pid } = query;

  const projectMutation = useSaveProject({
    requestConfig: {
      method: 'PATCH',
    },
  });

  const { addToast } = useToasts();

  const onFailure = useCallback(() => {
    projectMutation.mutate({
      id: `${pid}`,
      data: {
        metadata: {
          cache: new Date().getTime(),
        },
      },
    }, {
      onSuccess: () => {
      },
      onError: () => {
        addToast('onFailure', (
          <>
            <h2 className="font-medium">Error!</h2>
          </>
        ), {
          level: 'error',
        });
      },
    });
  }, [pid, projectMutation, addToast]);

  const onFailureDownloadProject = useCallback(() => {
    projectMutation.mutate({
      id: `${pid}`,
      data: {
        metadata: {
          cache: new Date().getTime(),
        },
      },
    }, {
      onSuccess: () => {
      },
      onError: () => {
        addToast('onFailureDownloadProject', (
          <>
            <h2 className="font-medium">Error!</h2>
          </>
        ), {
          level: 'error',
        });
      },
    });
  }, [pid, projectMutation, addToast]);

  return {
    default: onFailure,
    planningUnits: onFailure,
    export: onFailureDownloadProject,
  };
};
