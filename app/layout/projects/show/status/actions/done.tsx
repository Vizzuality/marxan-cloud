import React, { useCallback, useMemo, MutableRefObject } from 'react';

import { useQueryClient } from 'react-query';

import { useRouter } from 'next/router';

import { useSaveProject } from 'hooks/projects';
import { useToasts } from 'hooks/toast';

import { Job } from 'types/api/job';

export const useProjectActionsDone = () => {
  const { query } = useRouter();
  const { pid } = query as { pid: string };
  const queryClient = useQueryClient();
  const { addToast } = useToasts();

  const { mutate } = useSaveProject({
    requestConfig: {
      method: 'PATCH',
    },
  });

  const onDone = useCallback(
    (JOB_REF: MutableRefObject<Job>) => {
      mutate(
        {
          id: `${pid}`,
          data: {
            metadata: {
              cache: new Date().getTime(),
            },
          },
        },
        {
          onSuccess: () => {
            JOB_REF.current = null;
          },
          onError: () => {
            addToast(
              'onDone',
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
    },
    [pid, mutate, addToast]
  );

  const onCloneImportDone = useCallback(
    (JOB_REF: MutableRefObject<Job>) => {
      mutate(
        {
          id: `${pid}`,
          data: {
            metadata: {
              cache: new Date().getTime(),
            },
          },
        },
        {
          onSuccess: async () => {
            JOB_REF.current = null;
            await queryClient.invalidateQueries('projects');
            await queryClient.invalidateQueries(['scenarios', pid]);
          },
          onError: () => {
            addToast(
              'onDone',
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
    },
    [pid, mutate, addToast, queryClient]
  );

  const onLegacyImportDone = useCallback(
    (JOB_REF: MutableRefObject<Job>) => {
      mutate(
        {
          id: `${pid}`,
          data: {
            metadata: {
              cache: new Date().getTime(),
            },
          },
        },
        {
          onSuccess: async () => {
            JOB_REF.current = null;
            await queryClient.invalidateQueries('projects');
            await queryClient.invalidateQueries(['scenarios', pid]);
          },
          onError: () => {
            addToast(
              'onDone',
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
    },
    [pid, mutate, addToast, queryClient]
  );

  const onCostSurfaceUpload = useCallback(
    (JOB_REF: MutableRefObject<Job>) => {
      mutate(
        {
          id: `${pid}`,
          data: {
            metadata: {
              cache: new Date().getTime(),
            },
          },
        },
        {
          onSuccess: async () => {
            JOB_REF.current = null;
            await queryClient.invalidateQueries(['project', pid]);
            await queryClient.invalidateQueries(['cost-surfaces', pid]);
          },
        }
      );
    },
    [queryClient, pid, mutate]
  );

  return useMemo(
    () => ({
      default: onDone,
      planningUnits: onDone,
      export: onDone,
      import: onCloneImportDone,
      clone: onCloneImportDone,
      legacy: onLegacyImportDone,
      costSurface: onCostSurfaceUpload,
    }),
    [onDone, onCloneImportDone, onLegacyImportDone, onCostSurfaceUpload]
  );
};
