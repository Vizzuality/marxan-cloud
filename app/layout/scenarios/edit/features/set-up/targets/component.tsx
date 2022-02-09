import React, { useCallback, useMemo, useState } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';

import { useRouter } from 'next/router';

import cx from 'classnames';
import { ScenarioSidebarTabs, ScenarioSidebarSubTabs } from 'utils/tabs';
import { mergeScenarioStatusMetaData } from 'utils/utils-scenarios';

import {
  useSaveSelectedFeatures, useSelectedFeatures, useTargetedFeatures,
} from 'hooks/features';
import { useSaveScenario, useScenario } from 'hooks/scenarios';

import Button from 'components/button';
import Item from 'components/features/target-spf-item';
import Loading from 'components/loading';

export interface ScenariosFeaturesListProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const ScenariosFeaturesList: React.FC<ScenariosFeaturesListProps> = ({
  onBack,
  onSuccess,
}: ScenariosFeaturesListProps) => {
  const [submitting, setSubmitting] = useState(false);
  const { query } = useRouter();
  const { sid } = query;

  const selectedFeaturesMutation = useSaveSelectedFeatures({});
  const saveScenarioMutation = useSaveScenario({
    requestConfig: {
      method: 'PATCH',
    },
  });

  const {
    data: selectedFeaturesData,
  } = useSelectedFeatures(sid, {});

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

  const onChangeTargetAll = useCallback((v, input) => {
    const { value, onChange } = input;
    const features = [...value].map((f) => ({
      ...f,
      target: v,
    }));
    onChange(features);
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

  const onChangeFPFAll = useCallback((v, input) => {
    const { value, onChange } = input;
    const features = [...value].map((f) => ({
      ...f,
      fpf: v,
    }));
    onChange(features);
  }, []);

  const onRemove = useCallback((id, input) => {
    const { value, onChange } = input;
    const features = [...value];

    const featureIndex = features.findIndex((f) => f.id === id);
    features.splice(featureIndex, 1);
    onChange(features);
  }, []);

  const onSubmit = useCallback((values) => {
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
              console.info(values);

              return {
                ...go,
                splits: splits.map((s) => {
                  const { target, fpf = 1 } = features.find((f) => {
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

    // // Save current features
    selectedFeaturesMutation.mutate({
      id: `${sid}`,
      data,
    }, {
      onSuccess: () => {
        saveScenarioMutation.mutate({
          id: `${sid}`,
          data: {
            metadata: mergeScenarioStatusMetaData(metadata, {
              tab: ScenarioSidebarTabs.PARAMETERS,
              subtab: ScenarioSidebarSubTabs.ANALYSIS_PREVIEW,
            }),
          },
        }, {
          onSuccess: () => {
            onSuccess();
            setSubmitting(false);
          },
          onError: () => {
            setSubmitting(false);
          },
        });
      },
      onError: () => {
        setSubmitting(false);
      },
    });

    // onSuccess();
  }, [sid,
    metadata,
    selectedFeaturesData,
    selectedFeaturesMutation,
    saveScenarioMutation,
    onSuccess,
  ]);

  // Render
  if (targetedFeaturesIsFetching && !targetedFeaturesIsFetched) {
    return (
      <Loading
        visible
        className="z-40 flex items-center justify-center w-full h-40 bg-transparent bg-opacity-90"
        iconClassName="w-10 h-10 text-primary-500"
      />
    );
  }

  return (
    <FormRFF
      key="features-target"
      onSubmit={onSubmit}
      initialValues={INITIAL_VALUES}
    >
      {({ handleSubmit, values }) => (
        <form onSubmit={handleSubmit} autoComplete="off" className="relative flex flex-col flex-grow overflow-hidden">
          <Loading
            visible={submitting || targetedFeaturesIsFetching}
            className="absolute top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center w-full h-full bg-gray-700 bg-opacity-90"
            iconClassName="w-10 h-10 text-white"
          />

          {(!targetedFeaturesData || !targetedFeaturesData.length) && (
            <div className="flex items-center justify-center w-full h-40 text-sm uppercase">
              No results found
            </div>
          )}

          {!!targetedFeaturesData && !!targetedFeaturesData.length && (
            <div className="relative flex flex-col flex-grow overflow-hidden">
              <div className="absolute top-0 left-0 z-10 w-full h-6 pointer-events-none bg-gradient-to-b from-gray-700 via-gray-700" />
              <div className="relative h-full px-0.5 overflow-x-visible overflow-y-auto">
                <FieldRFF name="features">
                  {({ input }) => (
                    <div className="py-6">
                      <Item
                        id="all-targets"
                        defaultTarget={50}
                        defaultFPF={1}
                        isAllTargets
                        onChangeTarget={(v) => {
                          onChangeTargetAll(v, input);
                        }}
                        onChangeFPF={(v) => {
                          onChangeFPFAll(v, input);
                        }}
                      />

                      {values.features.map((item, i) => {
                        return (
                          <div
                            className={cx({
                              'mt-1.5': i !== 0,
                            })}
                            key={`${item.id}`}
                          >
                            <Item
                              {...item}
                              onChangeTarget={(v) => {
                                onChangeTarget(item.id, v, input);
                              }}
                              onChangeFPF={(v) => {
                                onChangeFPF(item.id, v, input);
                              }}
                              onRemove={() => {
                                onRemove(item.id, input);
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </FieldRFF>
              </div>
              <div className="absolute bottom-0 left-0 z-10 w-full h-6 pointer-events-none bg-gradient-to-t from-gray-700 via-gray-700" />
            </div>
          )}

          {!!targetedFeaturesData && !!targetedFeaturesData.length && (
            <div className="flex justify-center flex-shrink-0 space-x-3">
              <Button
                className="w-full"
                type="button"
                theme="secondary"
                size="lg"
                onClick={onBack}
              >
                Back
              </Button>

              <Button
                className="w-full"
                type="submit"
                theme="primary"
                size="lg"
                disabled={submitting}
              >
                Save
              </Button>
            </div>
          )}
        </form>
      )}
    </FormRFF>
  );
};

export default ScenariosFeaturesList;
