import React, { useCallback, useMemo, useState } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import { useQueryClient } from 'react-query';

import { useRouter } from 'next/router';

import { useSaveSelectedFeatures, useSelectedFeatures } from 'hooks/features';

import cx from 'classnames';

import IntersectFeatures from 'layout/scenarios/sidebar/features/intersect';

import Button from 'components/button';
import Item from 'components/features/selected-item';
import Loading from 'components/loading';
import Modal from 'components/modal';

export interface ScenariosFeaturesListProps {
  onSuccess: () => void
}

export const ScenariosFeaturesList: React.FC<ScenariosFeaturesListProps> = ({
  onSuccess,
}: ScenariosFeaturesListProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [intersecting, setIntersecting] = useState(null);
  const { query } = useRouter();
  const { pid, sid } = query;

  const queryClient = useQueryClient();

  const selectedFeaturesMutation = useSaveSelectedFeatures({});

  const {
    data: selectedFeaturesData,
    isFetching: selectedFeaturesIsFetching,
    isFetched: selectedFeaturesIsFetched,
  } = useSelectedFeatures(sid, {});

  const INITIAL_VALUES = useMemo(() => {
    return {
      features: selectedFeaturesData || [],
    };
  }, [selectedFeaturesData]);

  // Callbacks
  const getFeaturesRecipe = useCallback((features) => {
    return {
      status: 'draft',
      features: features.map((s) => {
        const {
          featureId,
          splitSelected,
          splitFeaturesSelected,
          intersectFeaturesSelected,
        } = s;

        const {
          marxanSettings,
          geoprocessingOperations,
        } = selectedFeaturesData.find((sf) => sf.featureId === featureId) || {};

        const kind = (splitSelected || intersectFeaturesSelected?.length) ? 'withGeoprocessing' : 'plain';

        let newGeoprocessingOperations;

        if (splitSelected) {
          newGeoprocessingOperations = [
            {
              kind: 'split/v1',
              splitByProperty: splitSelected,
              splits: splitFeaturesSelected.map((sf) => {
                return {
                  value: sf.id,
                };
              }),
            },
          ];
        }

        if (intersectFeaturesSelected?.length) {
          newGeoprocessingOperations = geoprocessingOperations;
        }

        return {
          featureId,
          kind,
          ...!!newGeoprocessingOperations && {
            geoprocessingOperations: newGeoprocessingOperations,
          },
          ...!!marxanSettings && {
            marxanSettings,
          },
        };
      }),
    };
  }, [selectedFeaturesData]);

  const onSplitSelected = useCallback((id, key, input) => {
    const { value, onChange } = input;
    const features = [...value];

    const feature = features.find((f) => f.id === id);
    const featureIndex = features.findIndex((f) => f.id === id);

    const { splitOptions } = feature;
    const splitFeaturesOptions = key ? splitOptions
      .find((s) => s.key === key).values
      .map((v) => ({ label: v.name, value: v.id }))
      : [];

    features[featureIndex] = {
      ...feature,
      splitSelected: key,
      splitFeaturesOptions,
      splitFeaturesSelected: splitFeaturesOptions.map((s) => ({
        id: s.value,
        name: s.label,
        target: 50,
        fpf: 1,
      })),
    };
    onChange(features);
  }, []);

  const onSplitFeaturesSelected = useCallback((id, key, input) => {
    const { value, onChange } = input;
    const features = [...value];

    const feature = features.find((f) => f.id === id);
    const featureIndex = features.findIndex((f) => f.id === id);

    features[featureIndex] = {
      ...feature,
      splitFeaturesSelected: key,
    };
    onChange(features);
  }, []);

  const onRemove = useCallback((id, input) => {
    const { value, onChange } = input;
    const features = [...value];

    const featureIndex = features.findIndex((f) => f.id === id);
    features.splice(featureIndex, 1);
    onChange(features);

    const data = getFeaturesRecipe(features);

    // Save current features
    selectedFeaturesMutation.mutate({
      id: `${sid}`,
      data,
    }, {
      onSuccess: () => {
        setSubmitting(false);
      },
      onError: () => {
        setSubmitting(false);
      },
    });
  }, [sid, getFeaturesRecipe, selectedFeaturesMutation]);

  const onSubmit = useCallback((values) => {
    const { features } = values;
    const data = getFeaturesRecipe(features);
    setSubmitting(true);

    // Save current features
    selectedFeaturesMutation.mutate({
      id: `${sid}`,
      data,
    }, {
      onSuccess: () => {
        onSuccess();
        setSubmitting(false);
      },
      onError: () => {
        setSubmitting(false);
      },
    });
  }, [sid, selectedFeaturesMutation, onSuccess, getFeaturesRecipe]);

  // Render
  if (selectedFeaturesIsFetching && !selectedFeaturesIsFetched) {
    return (
      <Loading
        visible
        className="z-40 flex items-center justify-center w-full h-40 bg-transparent bg-opacity-90"
        iconClassName="w-5 h-5 text-primary-500"
      />
    );
  }

  return (
    <FormRFF
      key="features-list"
      onSubmit={onSubmit}
      initialValues={INITIAL_VALUES}
    >
      {({ handleSubmit, values }) => (
        <form onSubmit={handleSubmit} autoComplete="off" className="relative flex flex-col flex-grow overflow-hidden">
          <Loading
            visible={submitting || selectedFeaturesIsFetching}
            className="absolute top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center w-full h-full bg-gray-700 bg-opacity-90"
            iconClassName="w-10 h-10 text-white"
          />

          {!!selectedFeaturesData && !!selectedFeaturesData.length && (
            <div className="relative flex flex-col flex-grow min-h-0 overflow-hidden">
              <div className="absolute top-0 left-0 z-10 w-full h-6 pointer-events-none bg-gradient-to-b from-gray-700 via-gray-700" />
              <div className="relative px-0.5 overflow-x-visible overflow-y-auto">
                <FieldRFF name="features">
                  {({ input }) => (
                    <div className="py-6">
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
                              onSplitSelected={(s) => {
                                onSplitSelected(item.id, s, input);
                              }}
                              onSplitFeaturesSelected={(s) => {
                                onSplitFeaturesSelected(item.id, s, input);
                              }}
                              onIntersectSelected={(id) => {
                                setIntersecting(id);
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

          {!!selectedFeaturesData && !!selectedFeaturesData.length && (
            <Button
              type="submit"
              theme="secondary-alt"
              size="lg"
              className="flex-shrink-0"
            >
              Continue
            </Button>
          )}

          <Modal
            title="Bioregional features"
            open={intersecting}
            size="narrow"
            onDismiss={() => {
              setIntersecting(null);
              queryClient.removeQueries(['all-features', pid]);
            }}
          >
            <IntersectFeatures
              intersecting={intersecting}
            />
          </Modal>

        </form>
      )}
    </FormRFF>
  );
};

export default ScenariosFeaturesList;
