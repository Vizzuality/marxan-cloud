import React, {
  useCallback,
} from 'react';

import { useQueryClient } from 'react-query';

import { useRouter } from 'next/router';

// import { ScenarioSidebarTabs } from 'utils/tabs';
// import { mergeScenarioStatusMetaData } from 'utils/utils-scenarios';

import { useSaveProject } from 'hooks/projects';
// import { useScenarios, useSaveScenario } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';

export const useProjectActionsDone = () => {
  const { query } = useRouter();
  const { pid } = query;

  const queryClient = useQueryClient();

  const { addToast } = useToasts();

  // const { data: scenariosData } = useScenarios(pid, {
  //   filters: {
  //     projectId: pid,
  //   },
  // });

  // const scenarioMutation = useSaveScenario({
  //   requestConfig: {
  //     method: 'PATCH',
  //   },
  // });

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

  const onLegacyImportDone = useCallback((JOB_REF) => {
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
  }, [
    pid,
    projectMutation,
    addToast,
    queryClient,
    // scenariosData,
  ]);

  return {
    default: onDone,
    planningUnits: onDone,
    export: onDone,
    import: onCloneImportDone,
    clone: onCloneImportDone,
    legacy: onLegacyImportDone,
  };
};
