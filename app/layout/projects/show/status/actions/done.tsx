import React, {
  useCallback,
} from 'react';

import { useQueryClient } from 'react-query';

import { useRouter } from 'next/router';

import { useSaveProject } from 'hooks/projects';
import { useToasts } from 'hooks/toast';

export const useProjectActionsDone = () => {
  const { query } = useRouter();
  const { pid } = query;

  const queryClient = useQueryClient();

  const { addToast } = useToasts();

  const projectMutation = useSaveProject({
    requestConfig: {
      method: 'PATCH',
    },
  });

  const onDone = useCallback((JOB_REF) => {
    projectMutation.mutate({
      id: `${pid}`,
      data: {
        metadata: {
          cache: new Date().getTime(),
        },
      },
    }, {
      onSuccess: () => {
        JOB_REF.current = null;
      },
      onError: () => {
        addToast('onDone', (
          <>
            <h2 className="font-medium">Error!</h2>
          </>
        ), {
          level: 'error',
        });
      },
    });
  }, [pid, projectMutation, addToast]);

  const onCloneImportDone = useCallback((JOB_REF) => {
    projectMutation.mutate({
      id: `${pid}`,
      data: {
        metadata: {
          cache: new Date().getTime(),
        },
      },
    }, {
      onSuccess: () => {
        JOB_REF.current = null;
        queryClient.invalidateQueries('projects');
        queryClient.invalidateQueries(['scenarios', pid]);
      },
      onError: () => {
        addToast('onDone', (
          <>
            <h2 className="font-medium">Error!</h2>
          </>
        ), {
          level: 'error',
        });
      },
    });
  }, [pid, projectMutation, addToast, queryClient]);

  return {
    default: onDone,
    planningUnits: onDone,
    export: onDone,
    import: onCloneImportDone,
    clone: onCloneImportDone,
  };
};
