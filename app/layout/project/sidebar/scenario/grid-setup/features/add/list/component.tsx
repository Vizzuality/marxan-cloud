import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Form as FormRFF, FormSpy as FormSpyRFF, Field as FieldRFF } from 'react-final-form';
import { useQueryClient } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { useSaveSelectedFeatures, useSelectedFeatures } from 'hooks/features';
import { useCanEditScenario } from 'hooks/permissions';
import { useSaveScenario, useScenario } from 'hooks/scenarios';

import Button from 'components/button';
import ConfirmationPrompt from 'components/confirmation-prompt';
import Item from 'components/features/selected-item';
import Loading from 'components/loading';
import Modal from 'components/modal';
import { ScrollArea } from 'components/scroll-area';
import { Feature } from 'types/api/feature';
import { ScenarioSidebarTabs, ScenarioSidebarSubTabs } from 'utils/tabs';
import { mergeScenarioStatusMetaData } from 'utils/utils-scenarios';

import DELETE_WARNING_SVG from 'svgs/notifications/delete-warning.svg?sprite';

import IntersectFeatures from '../intersect';

export const ScenariosFeaturesList = ({ onContinue }): JSX.Element => {
  const [submitting, setSubmitting] = useState(false);
  const [intersecting, setIntersecting] = useState(null);
  const [deleteFeature, setDeleteFeature] = useState(null);

  const { query } = useRouter();
  const { pid, sid } = query as { pid: string; sid: string };

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setFeatures, setLayerSettings, setSelectedFeatures, setSelectedContinuousFeatures } =
    scenarioSlice.actions;
  const { selectedFeatures, selectedContinuousFeatures, layerSettings, features } = useSelector(
    (state) => state[`/scenarios/${sid}/edit`]
  );

  console.log({ featuresRedux: features });

  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const editable = useCanEditScenario(pid, sid);
  const selectedFeaturesMutation = useSaveSelectedFeatures({});
  const saveScenarioMutation = useSaveScenario({
    requestConfig: {
      method: 'PATCH',
    },
  });

  const { data: scenarioData } = useScenario(sid);
  const { metadata } = scenarioData || {};

  const {
    data: selectedFeaturesData,
    isFetching: selectedFeaturesIsFetching,
    isFetched: selectedFeaturesIsFetched,
  } = useSelectedFeatures(sid);

  const INITIAL_VALUES = useMemo(() => {
    return {
      features: selectedFeaturesData || [],
    };
  }, [selectedFeaturesData]);

  // Callbacks
  const getFeaturesRecipe = useCallback(
    (features) => {
      return {
        status: 'draft',
        features: features.map((s) => {
          const { featureId, splitSelected, splitFeaturesSelected, intersectFeaturesSelected } = s;

          const { marxanSettings, geoprocessingOperations } =
            selectedFeaturesData.find((sf) => sf.featureId === featureId) || {};

          const kind =
            splitSelected || intersectFeaturesSelected?.length ? 'withGeoprocessing' : 'plain';

          let newGeoprocessingOperations;

          if (splitSelected) {
            newGeoprocessingOperations = [
              {
                kind: 'split/v1',
                splitByProperty: splitSelected,
                splits: splitFeaturesSelected.map((sf) => {
                  return {
                    value: sf.id,
                    marxanSettings: sf.marxanSettings || {
                      fpf: 1,
                      prop: 0.5,
                    },
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
            ...(!!newGeoprocessingOperations && {
              geoprocessingOperations: newGeoprocessingOperations,
            }),
            ...(!newGeoprocessingOperations && {
              marxanSettings: marxanSettings || {
                fpf: 1,
                prop: 0.5,
              },
            }),
          };
        }),
      };
    },
    [selectedFeaturesData]
  );

  const onSplitSelected = useCallback((id, key, input) => {
    const { value, onChange } = input;
    const features = [...value];

    const feature = features.find((f) => f.id === id);
    const featureIndex = features.findIndex((f) => f.id === id);

    const { splitOptions } = feature;
    const splitFeaturesOptions = key
      ? splitOptions
          .find((s) => s.key === key)
          .values.map((v) => ({ label: v.name, value: `${v.id}` }))
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

  const onSplitFeaturesSelected = useCallback(
    (id, key, input) => {
      const { value, onChange } = input;
      const features = [...value];

      const feature = features.find((f) => f.id === id);
      const featureIndex = features.findIndex((f) => f.id === id);

      features[featureIndex] = {
        ...feature,
        splitFeaturesSelected: key,
      };

      onChange(features);
      dispatch(setFeatures(features));
    },
    [dispatch, setFeatures]
  );

  const onRemove = useCallback(
    (id, input) => {
      const { value, onChange } = input;
      const features = [...value];

      const featureIndex = features.findIndex((f) => f.id === id);
      features.splice(featureIndex, 1);
      onChange(features);

      const data = getFeaturesRecipe(features);

      // Save current features
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
            setDeleteFeature(null);
          },
        }
      );
    },
    [sid, queryClient, getFeaturesRecipe, selectedFeaturesMutation]
  );

  const onSubmit = useCallback(
    (values) => {
      const { features } = values;
      console.log({ onSubmit: features });
      const data = getFeaturesRecipe(features);
      setSubmitting(true);

      // Save current features
      selectedFeaturesMutation.mutate(
        {
          id: `${sid}`,
          data,
        },
        {
          onSuccess: () => {
            saveScenarioMutation.mutate({
              id: `${sid}`,
              data: {
                metadata: mergeScenarioStatusMetaData(metadata, {
                  tab: ScenarioSidebarTabs.FEATURES,
                  subtab: ScenarioSidebarSubTabs.FEATURES_TARGET,
                }),
              },
            });
            onContinue();
          },
          onError: () => {
            setSubmitting(false);
          },
        }
      );
    },
    [sid, selectedFeaturesMutation, getFeaturesRecipe, metadata, saveScenarioMutation, onContinue]
  );

  const handleContinue = useCallback(() => {
    setSubmitting(true);
    onContinue();
  }, [onContinue]);

  const toggleSeeOnMap = useCallback(
    (id: Feature['id']) => {
      const binaryFeatures = [...selectedFeatures];
      const continuousFeatures = [...selectedContinuousFeatures];

      const isIncludedInBinary = binaryFeatures.includes(id);
      const isIncludedInContinuous = continuousFeatures.includes(id);

      const feature = selectedFeaturesData?.find(({ id: featureId }) => featureId === id);
      const isContinuous = feature.amountRange.min !== null && feature.amountRange.max !== null;

      if (isContinuous) {
        if (!isIncludedInContinuous) {
          continuousFeatures.push(id);
        } else {
          const i = continuousFeatures.indexOf(id);
          continuousFeatures.splice(i, 1);
        }

        dispatch(setSelectedContinuousFeatures(continuousFeatures));
      } else {
        if (!isIncludedInBinary) {
          binaryFeatures.push(id);
        } else {
          const i = binaryFeatures.indexOf(id);
          binaryFeatures.splice(i, 1);
        }
        dispatch(setSelectedFeatures(binaryFeatures));
      }

      const selectedFeature = selectedFeaturesData.find(({ featureId }) => featureId === id);
      const { color } = selectedFeature || {};

      dispatch(
        setLayerSettings({
          id,
          settings: {
            visibility: !(isIncludedInBinary || isIncludedInContinuous),
            color,
            ...(isContinuous && {
              amountRange: feature.amountRange,
            }),
          },
        })
      );
    },
    [
      dispatch,
      setSelectedFeatures,
      setLayerSettings,
      selectedFeatures,
      selectedContinuousFeatures,
      setSelectedContinuousFeatures,
      selectedFeaturesData,
    ]
  );

  useEffect(() => {
    return () => {
      dispatch(setSelectedFeatures([]));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render
  if (selectedFeaturesIsFetching && !selectedFeaturesIsFetched) {
    return (
      <Loading
        visible
        className="z-40 flex h-40 w-full items-center justify-center bg-transparent bg-opacity-90"
        iconClassName="w-10 h-10 text-primary-500"
      />
    );
  }

  return (
    <FormRFF key="features-list" onSubmit={onSubmit} initialValues={INITIAL_VALUES}>
      {({ handleSubmit, values }) => (
        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="relative flex flex-grow flex-col space-y-2 overflow-hidden"
        >
          <FormSpyRFF
            subscription={{ dirty: true, touched: true }}
            onChange={(state) => {
              if (state.touched.features) {
                dispatch(setFeatures(values.features));
              }
            }}
          />

          <Loading
            visible={submitting || selectedFeaturesIsFetching}
            className="absolute bottom-0 left-0 right-0 top-0 z-40 flex h-full w-full items-center justify-center bg-gray-800 bg-opacity-90"
            iconClassName="w-10 h-10 text-white"
          />

          {!!selectedFeaturesData && !!selectedFeaturesData.length && (
            <div className="relative flex h-full min-h-0 flex-grow flex-col overflow-hidden before:pointer-events-none before:absolute before:left-0 before:top-0 before:z-10 before:h-6 before:w-full before:bg-gradient-to-b before:from-gray-800 before:via-gray-800 after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:z-10 after:h-6 after:w-full after:bg-gradient-to-t after:from-gray-800 after:via-gray-800">
              <ScrollArea className="h-full">
                <div className="relative max-h-full px-0.5">
                  <FieldRFF name="features">
                    {({ input }) => (
                      <ul className="space-y-1.5 overflow-y-auto py-6">
                        {values.features.map((item, i) => {
                          return (
                            <li key={`${item.id}`}>
                              <Item
                                {...item}
                                editable={editable}
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
                                  setDeleteFeature(item);
                                }}
                                isShown={layerSettings[item.id]?.visibility}
                                onSeeOnMap={() => toggleSeeOnMap(item.id)}
                              />
                              <ConfirmationPrompt
                                title={`Are you sure you want to remove "${deleteFeature?.name}" feature?`}
                                icon={DELETE_WARNING_SVG}
                                open={!!deleteFeature}
                                onAccept={() => onRemove(deleteFeature?.id, input)}
                                onRefuse={() => setDeleteFeature(null)}
                                onDismiss={() => setDeleteFeature(null)}
                              />
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </FieldRFF>
                </div>
              </ScrollArea>
            </div>
          )}

          {!!selectedFeaturesData && !!selectedFeaturesData.length && editable && (
            <Button type="submit" theme="secondary-alt" size="lg" className="flex-shrink-0">
              Continue
            </Button>
          )}

          {!!selectedFeaturesData && !!selectedFeaturesData.length && !editable && (
            <Button
              type="button"
              theme="secondary-alt"
              size="lg"
              className="flex-shrink-0"
              onClick={handleContinue}
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
            <IntersectFeatures intersecting={intersecting} />
          </Modal>
        </form>
      )}
    </FormRFF>
  );
};

export default ScenariosFeaturesList;
