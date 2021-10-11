import React, {
  useCallback,
} from 'react';

import { useRouter } from 'next/router';

import { useProject, useSaveProject } from 'hooks/projects';
import { useToasts } from 'hooks/toast';

export const useProjectActionsDone = () => {
  const { query } = useRouter();
  const { pid } = query;

  const { data: projectData } = useProject(pid);
  const projectMutation = useSaveProject({
    requestConfig: {
      method: 'PATCH',
    },
  });

  const { addToast } = useToasts();

  const onPlanningUnitsDone = useCallback((JOB_REF) => {
    projectMutation.mutate({
      id: `${pid}`,
      data: {
        name: projectData.name,
      },
    }, {
      onSuccess: () => {
        JOB_REF.current = null;
      },
      onError: () => {
        addToast('onPlanningAreaProtectedCalculationDone', (
          <>
            <h2 className="font-medium">Error!</h2>
          </>
        ), {
          level: 'error',
        });
      },
    });
  }, [pid, projectData, projectMutation, addToast]);

  return {
    planningUnits: onPlanningUnitsDone,
  };
};
