import React, {
  useCallback,
} from 'react';

import { useRouter } from 'next/router';

import { useDownloadProject, useExportId, useSaveProject } from 'hooks/projects';
import { useToasts } from 'hooks/toast';

export const useProjectActionsDone = () => {
  const { query } = useRouter();
  const { pid } = query;

  const { addToast } = useToasts();

  const projectMutation = useSaveProject({
    requestConfig: {
      method: 'PATCH',
    },
  });

  const downloadProject = useDownloadProject({});
  const { data: exportId } = useExportId(pid);

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

  const onDownloadProjectDone = useCallback((JOB_REF) => {
    projectMutation.mutate({
      id: `${pid}`,
      data: {
        metadata: {
          cache: new Date().getTime(),
          // cacheByUserId: { userId, cache: new Date().getTime() }
        },
      },
    }, {
      onSuccess: () => {
        JOB_REF.current = null;
        downloadProject.mutate({
          id: `${pid}`,
          exportId: `${exportId}`,
        }, {
          onSuccess: () => {

          },
          onError: () => {
            addToast('download-error', (
              <>
                <h2 className="font-medium">Error!</h2>
                <ul className="text-sm">
                  Project not downloaded. Try again.
                </ul>
              </>
            ), {
              level: 'error',
            });
          },
        });
      },
      onError: () => {
        addToast('onDownloadProject', (
          <>
            <h2 className="font-medium">Error!</h2>
          </>
        ), {
          level: 'error',
        });
      },
    });
  }, [pid, projectMutation, addToast, downloadProject, exportId]);

  return {
    default: onDone,
    planningUnits: onDone,
    export: onDownloadProjectDone,
  };
};
