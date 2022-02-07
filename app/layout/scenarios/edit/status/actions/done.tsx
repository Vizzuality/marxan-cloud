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
    setTab,
    setSubTab,
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
            tab: 'planning-unit',
            subtab: scenarioData?.metadata?.scenarioEditingMetadata.subtab === 'pu-protected-areas-threshold' ? null : 'pu-protected-areas-threshold',
            status: {
              'protected-areas': 'draft',
              features: 'empty',
              analysis: 'empty',
              solutions: 'empty',
            },
            lastJobCheck: new Date().getTime(),
          },
        },
      },
    }, {
      onSuccess: () => {
        dispatch(setJob(null));
        dispatch(setCache(Date.now()));
        dispatch(setTab('planning-unit'));
        dispatch(setSubTab('pu-protected-areas-threshold'));
        queryClient.invalidateQueries(['protected-areas']);
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
    setTab,
    setSubTab,
    addToast,
    queryClient,
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
            tab: 'planning-unit',
            subtab: 'pu-protected-areas-threshold',
            status: {
              'protected-areas': 'draft',
              features: 'empty',
              analysis: 'empty',
              solutions: 'empty',
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

  // Calibration
  const onCalibrationDone = useCallback((JOB_REF) => {
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
        const scenarioId = sid;
        queryClient.invalidateQueries(['scenario-calibration', scenarioId]);
        JOB_REF.current = null;
      },
      onError: () => {
        addToast('onCalibrationDone', (
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

  // Run
  const onRunDone = useCallback((JOB_REF) => {
    scenarioMutation.mutate({
      id: `${sid}`,
      data: {
        metadata: {
          ...scenarioData?.metadata,
          scenarioEditingMetadata: {
            ...scenarioData?.metadata?.scenarioEditingMetadata,
            lastJobCheck: new Date().getTime(),
            status: {
              'protected-areas': 'draft',
              features: 'draft',
              analysis: 'draft',
              solutions: 'draft',
            },
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
    setCache,
    addToast,
  ]);

  return {
    features: onFeaturesDone,
    planningAreaProtectedCalculation: onPlanningAreaProtectedCalculationDone,
    protectedAreas: onProtectedAreasDone,
    costSurface: onCostSurfaceDone,
    planningUnitsInclusion: onPlanningUnitsInclusionDone,
    calibration: onCalibrationDone,
    run: onRunDone,
  };
};
