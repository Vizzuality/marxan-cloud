import React, {
  useCallback,
} from 'react';

import { useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { useSaveScenario, useScenario } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';

export const useScenarioActionsDone = () => {
  const { query } = useRouter();
  const { sid } = query;

  const dispatch = useDispatch();
  const scenarioSlice = getScenarioEditSlice(sid);
  const {
    setJob,
    setCache,
  } = scenarioSlice.actions;

  const { data: scenarioData } = useScenario(sid);

  const scenarioMutation = useSaveScenario({
    requestConfig: {
      method: 'PATCH',
    },
  });

  const { addToast } = useToasts();

  const queryClient = useQueryClient();

  // PLANNING AREA calculation
  const onPlanningAreaProtectedCalculationDone = useCallback((JOB_REF) => {
    scenarioMutation.mutate({
      id: `${sid}`,
      data: {
        metadata: {
          ...scenarioData?.metadata,
          scenarioEditingMetadata: {
            ...scenarioData?.metadata?.scenarioEditingMetadata,
            tab: 'protected-areas',
            subtab: 'protected-areas',
            status: {
              'protected-areas': 'draft',
              features: 'empty',
              analysis: 'empty',
            },
            lastJobCheck: new Date().getTime(),
          },
        },
      },
    }, {
      onSuccess: () => {
        dispatch(setJob(null));
        dispatch(setCache(Date.now()));
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
  }, [
    sid,
    scenarioMutation,
    scenarioData?.metadata,
    dispatch,
    setJob,
    setCache,
    addToast,
  ]);

  // Protected Areas
  const onProtectedAreasDone = useCallback((JOB_REF) => {
    scenarioMutation.mutate({
      id: `${sid}`,
      data: {
        metadata: {
          ...scenarioData?.metadata,
          scenarioEditingMetadata: {
            ...scenarioData?.metadata?.scenarioEditingMetadata,
            tab: 'protected-areas',
            subtab: 'protected-areas',
            status: {
              'protected-areas': 'draft',
              features: 'empty',
              analysis: 'empty',
            },
            lastJobCheck: new Date().getTime(),
          },
        },
      },
    }, {
      onSuccess: () => {
        dispatch(setJob(null));
        dispatch(setCache(Date.now()));
        JOB_REF.current = null;
      },
      onError: () => {
        addToast('onProtectedAreasDone', (
          <>
            <h2 className="font-medium">Error!</h2>
          </>
        ), {
          level: 'error',
        });
      },
    });
  }, [
    sid,
    scenarioMutation,
    scenarioData?.metadata,
    dispatch,
    setJob,
    setCache,
    addToast,
  ]);

  const onFeaturesDone = useCallback((JOB_REF) => {
    scenarioMutation.mutate({
      id: `${sid}`,
      data: {
        metadata: {
          ...scenarioData?.metadata,
          scenarioEditingMetadata: {
            ...scenarioData?.metadata?.scenarioEditingMetadata,
            lastJobCheck: new Date().getTime(),
          },
        },
      },
    }, {
      onSuccess: () => {
        dispatch(setJob(null));
        dispatch(setCache(Date.now()));
        JOB_REF.current = null;
      },
      onError: () => {
        addToast('onCostSurfaceDone', (
          <>
            <h2 className="font-medium">Error!</h2>
          </>
        ), {
          level: 'error',
        });
      },
    });
  }, [
    sid,
    scenarioMutation,
    scenarioData?.metadata,
    dispatch,
    setJob,
    setCache,
    addToast,
  ]);

  // Cost surface
  const onCostSurfaceDone = useCallback((JOB_REF) => {
    scenarioMutation.mutate({
      id: `${sid}`,
      data: {
        metadata: {
          ...scenarioData?.metadata,
          scenarioEditingMetadata: {
            ...scenarioData?.metadata?.scenarioEditingMetadata,
            lastJobCheck: new Date().getTime(),
          },
        },
      },
    }, {
      onSuccess: () => {
        dispatch(setJob(null));
        dispatch(setCache(Date.now()));
        queryClient.invalidateQueries(['scenarios-cost-surface', sid]);
        JOB_REF.current = null;
      },
      onError: () => {
        addToast('onCostSurfaceDone', (
          <>
            <h2 className="font-medium">Error!</h2>
          </>
        ), {
          level: 'error',
        });
      },
    });
  }, [
    sid,
    scenarioMutation,
    scenarioData?.metadata,
    dispatch,
    setJob,
    setCache,
    addToast,
    queryClient,
  ]);

  // Planning units inclusion
  const onPlanningUnitsInclusionDone = useCallback((JOB_REF) => {
    scenarioMutation.mutate({
      id: `${sid}`,
      data: {
        metadata: {
          ...scenarioData?.metadata,
          scenarioEditingMetadata: {
            ...scenarioData?.metadata?.scenarioEditingMetadata,
            lastJobCheck: new Date().getTime(),
          },
        },
      },
    }, {
      onSuccess: () => {
        dispatch(setJob(null));
        queryClient.invalidateQueries(['scenarios-pu', sid]);
        JOB_REF.current = null;
      },
      onError: () => {
        addToast('onPlanningUnitsInclusionDone', (
          <>
            <h2 className="font-medium">Error!</h2>
          </>
        ), {
          level: 'error',
        });
      },
    });
  }, [
    sid,
    scenarioMutation,
    scenarioData?.metadata,
    dispatch,
    setJob,
    addToast,
    queryClient,
  ]);

  const onRunDone = useCallback((JOB_REF) => {
    scenarioMutation.mutate({
      id: `${sid}`,
      data: {
        metadata: {
          ...scenarioData?.metadata,
          scenarioEditingMetadata: {
            ...scenarioData?.metadata?.scenarioEditingMetadata,
            lastJobCheck: new Date().getTime(),
          },
        },
      },
    }, {
      onSuccess: () => {
        dispatch(setJob(null));
        JOB_REF.current = null;
      },
      onError: () => {
        addToast('onRunRone', (
          <>
            <h2 className="font-medium">Error!</h2>
          </>
        ), {
          level: 'error',
        });
      },
    });
  }, [
    sid,
    scenarioMutation,
    scenarioData?.metadata,
    dispatch,
    setJob,
    addToast,
  ]);

  return {
    features: onFeaturesDone,
    planningAreaProtectedCalculation: onPlanningAreaProtectedCalculationDone,
    protectedAreas: onProtectedAreasDone,
    costSurface: onCostSurfaceDone,
    planningUnitsInclusion: onPlanningUnitsInclusionDone,
    run: onRunDone,
  };
};
