import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import { useQueryClient } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { useDebouncedCallback } from 'use-debounce';

import { useSaveSelectedFeatures, useSelectedFeatures, useTargetedFeatures } from 'hooks/features';
import { useCanEditScenario } from 'hooks/permissions';
import { useSaveScenario, useScenario } from 'hooks/scenarios';

import Button from 'components/button';
import ConfirmationPrompt from 'components/confirmation-prompt';
import Item from 'components/features/target-spf-item';
import Loading from 'components/loading';
import { cn } from 'utils/cn';

export const ScenariosFeaturesTargets = ({ onGoBack }: { onGoBack: () => void }): JSX.Element => {
  const [submitting, setSubmitting] = useState(false);
  const [confirmationTarget, setConfirmationTarget] = useState(null);
  const [confirmationFPF, setConfirmationFPF] = useState(null);

  const queryClient = useQueryClient();
  const { query } = useRouter();
  const { pid, sid } = query as { pid: string; sid: string };

  const dispatch = useDispatch();

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setSelectedFeatures } = scenarioSlice.actions;
  const { selectedFeatures } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const editable = useCanEditScenario(pid, sid);

  const selectedFeaturesMutation = useSaveSelectedFeatures({});
  const saveScenarioMutation = useSaveScenario({
    requestConfig: {
      method: 'PATCH',
    },
  });

  const { data: selectedFeaturesData } = useSelectedFeatures(sid, {});

  const {
    data: targetedFeaturesData,
    isFetching: targetedFeaturesIsFetching,
    isFetched: targetedFeaturesIsFetched,
  } = useTargetedFeatures(sid);

  const { data: scenarioData } = useScenario(sid);
  const { metadata } = scenarioData || {};

  const INITIAL_VALUES = useMemo(() => {
    return {
      features: targetedFeaturesData,
    };
  }, [targetedFeaturesData]);

  // Callbacks
  const onChangeTarget = useCallback((id, v, input) => {
    const { value, onChange } = input;
    const features = [...value];

    const feature = features.find((f) => f.id === id);
    const featureIndex = features.findIndex((f) => f.id === id);

    features[featureIndex] = {
      ...feature,
      target: v,
    };
    onChange(features);
  }, []);

  const onAskTargetAll = useDebouncedCallback((v, input) => {
    setConfirmationTarget({
      v,
      input,
    });
  }, 1000);

  const onChangeTargetAll = useCallback(({ v, input }) => {
    const { value, onChange } = input;
    const features = [...value].map((f) => ({
      ...f,
      target: v,
    }));
    onChange(features);

    setConfirmationTarget(null);
  }, []);

  const onChangeFPF = useCallback((id, v, input) => {
    const { value, onChange } = input;
    const features = [...value];

    const feature = features.find((f) => f.id === id);
    const featureIndex = features.findIndex((f) => f.id === id);

    features[featureIndex] = {
      ...feature,
      fpf: v,
    };
    onChange(features);
  }, []);

  const onAskFPFAll = useDebouncedCallback((v, input) => {
    setConfirmationFPF({
      v,
      input,
    });
  }, 250);

  const onChangeFPFAll = useCallback(({ v, input }) => {
    const { value, onChange } = input;
    const features = [...value].map((f) => ({
      ...f,
      fpf: v,
    }));
    onChange(features);

    setConfirmationFPF(null);
  }, []);

  const onRemove = useCallback((id, input) => {
    const { value, onChange } = input;
    const features = [...value];

    const featureIndex = features.findIndex((f) => f.id === id);
    features.splice(featureIndex, 1);
    onChange(features);
  }, []);

  const onSubmit = useCallback(
    (values) => {
      setSubmitting(true);
      const { features } = values;

      const data = {
        status: 'created',
        features: selectedFeaturesData.map((sf) => {
          const { featureId, kind, geoprocessingOperations } = sf;

          if (kind === 'withGeoprocessing') {
            return {
              featureId,
              kind,
              geoprocessingOperations: geoprocessingOperations.map((go) => {
                const { splits } = go;

                return {
                  ...go,
                  splits: splits
                    .filter((s) => {
                      return features.find((f) => {
                        return f.parentId === featureId && f.value === s.value;
                      });
                    })
                    .map((s) => {
                      const { target, fpf } = features.find((f) => {
                        return f.parentId === featureId && f.value === s.value;
                      });

                      return {
                        ...s,
                        marxanSettings: {
                          prop: target / 100 || 0.5,
                          fpf,
                        },
                      };
                    }),
                };
              }),
            };
          }

          const { target, fpf = 1 } = features.find((f) => f.featureId === featureId);
          return {
            featureId,
            kind,
            marxanSettings: {
              prop: target / 100 || 0.5,
              fpf,
            },
          };
        }),
      };

      selectedFeaturesMutation.mutate(
        {
          id: `${sid}`,
          data,
        },
        {
          onSuccess: async () => {
            await queryClient.invalidateQueries(['selected-features', sid]);
          },
          onSettled: () => {
            setSubmitting(false);
          },
        }
      );
    },
    [sid, queryClient, selectedFeaturesData, selectedFeaturesMutation]
  );

  const toggleSeeOnMap = useCallback(
    (id) => {
      const newSelectedFeatures = [...selectedFeatures];
      if (!newSelectedFeatures.includes(id)) {
        newSelectedFeatures.push(id);
      } else {
        const i = newSelectedFeatures.indexOf(id);
        newSelectedFeatures.splice(i, 1);
      }
      dispatch(setSelectedFeatures(newSelectedFeatures));
    },
    [dispatch, setSelectedFeatures, selectedFeatures]
  );

  const isShown = useCallback(
    (id) => {
      if (!selectedFeatures.includes(id)) {
        return false;
      }
      return true;
    },
    [selectedFeatures]
  );

  useEffect(() => {
    return () => {
      dispatch(setSelectedFeatures([]));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render
  if (targetedFeaturesIsFetching && !targetedFeaturesIsFetched) {
    return (
      <Loading
        visible
        className="z-40 flex h-40 w-full items-center justify-center bg-transparent bg-opacity-90"
        iconClassName="w-10 h-10 text-primary-500"
      />
    );
  }

  return (
    <FormRFF key="features-target" onSubmit={onSubmit} initialValues={INITIAL_VALUES}>
      {({ handleSubmit, values }) => (
        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="relative flex flex-grow flex-col overflow-hidden"
        >
          <Loading
            visible={submitting || targetedFeaturesIsFetching}
            className="absolute bottom-0 left-0 right-0 top-0 z-40 flex h-full w-full items-center justify-center bg-gray-700 bg-opacity-90"
            iconClassName="w-10 h-10 text-white"
          />

          {(!targetedFeaturesData || !targetedFeaturesData.length) && (
            <div className="flex h-40 w-full items-center justify-center text-sm uppercase">
              No results found
            </div>
          )}

          {!!targetedFeaturesData && !!targetedFeaturesData.length && (
            <div className="relative flex flex-grow flex-col overflow-hidden">
              <div className="pointer-events-none absolute left-0 top-0 z-10 h-6 w-full bg-gradient-to-b from-gray-700 via-gray-700" />
              <div className="relative h-full overflow-y-auto overflow-x-visible px-0.5">
                <FieldRFF name="features">
                  {({ input }) => (
                    <div className="py-6">
                      {editable && (
                        <>
                          <Item
                            id="all-targets"
                            defaultTarget={50}
                            defaultFPF={1}
                            isAllTargets
                            editable={editable}
                            onChangeTarget={(v) => {
                              onAskTargetAll(v, input);
                            }}
                            onChangeFPF={(v) => {
                              onAskFPFAll(v, input);
                            }}
                          />

                          <ConfirmationPrompt
                            title={`Are you sure you want to change all feature targets to ${confirmationTarget?.v}?`}
                            description="The action cannot be reverted."
                            open={!!confirmationTarget}
                            onAccept={() => {
                              onChangeTargetAll(confirmationTarget);
                            }}
                            onRefuse={() => setConfirmationTarget(null)}
                            onDismiss={() => setConfirmationTarget(null)}
                          />

                          <ConfirmationPrompt
                            title={`Are you sure you want to change all feature SPFs to ${confirmationFPF?.v}?`}
                            description="The action cannot be reverted."
                            open={!!confirmationFPF}
                            onAccept={() => onChangeFPFAll(confirmationFPF)}
                            onRefuse={() => setConfirmationFPF(null)}
                            onDismiss={() => setConfirmationFPF(null)}
                          />
                        </>
                      )}

                      {values.features.map((item, i) => {
                        return (
                          <div
                            className={cn({
                              'mt-1.5': i !== 0,
                            })}
                            key={`${item.id}`}
                          >
                            <Item
                              {...item}
                              editable={editable}
                              onChangeTarget={(v) => {
                                onChangeTarget(item.id, v, input);
                              }}
                              onChangeFPF={(v) => {
                                onChangeFPF(item.id, v, input);
                              }}
                              onRemove={() => {
                                onRemove(item.id, input);
                              }}
                              isShown={isShown(item.id)}
                              onSeeOnMap={() => toggleSeeOnMap(item.id)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </FieldRFF>
              </div>
              <div className="pointer-events-none absolute bottom-0 left-0 z-10 h-6 w-full bg-gradient-to-t from-gray-700 via-gray-700" />
            </div>
          )}

          {!!targetedFeaturesData && !!targetedFeaturesData.length && (
            <div className="flex flex-shrink-0 justify-center space-x-3">
              <Button
                className="w-full"
                type="button"
                theme="secondary"
                size="lg"
                onClick={onGoBack}
              >
                {editable ? 'Set features' : 'Back to features'}
              </Button>

              {editable && (
                <Button
                  className="w-full"
                  type="submit"
                  theme="primary"
                  size="lg"
                  disabled={submitting}
                >
                  Save
                </Button>
              )}
            </div>
          )}
        </form>
      )}
    </FormRFF>
  );
};

export default ScenariosFeaturesTargets;
