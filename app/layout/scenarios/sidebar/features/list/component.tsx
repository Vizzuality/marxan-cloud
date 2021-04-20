import React, { useCallback, useMemo } from 'react';
import cx from 'classnames';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';

import Button from 'components/button';
import Loading from 'components/loading';
import Item from 'components/features/selected-item';

import { useSelectedFeatures } from 'hooks/features';

export interface ScenariosFeaturesListProps {
  onSuccess: () => void
}

export const ScenariosFeaturesList: React.FC<ScenariosFeaturesListProps> = ({
  onSuccess,
}: ScenariosFeaturesListProps) => {
  const {
    data: selectedFeaturesData,
    isFetching: selectedFeaturesIsFetching,
    isFetched: selectedFeaturesIsFetched,
  } = useSelectedFeatures({});

  const INITIAL_VALUES = useMemo(() => {
    return {
      features: selectedFeaturesData || [],
    };
  }, [selectedFeaturesData]);

  // Callbacks
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

  const onSubmit = useCallback((values) => {
    console.info(values);
    onSuccess();
  }, [onSuccess]);

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
      key="features-add"
      onSubmit={onSubmit}
      initialValues={INITIAL_VALUES}
    >
      {({ handleSubmit, values }) => (
        <form onSubmit={handleSubmit} autoComplete="off" className="relative flex flex-col h-full overflow-hidden">
          {(!selectedFeaturesData || !selectedFeaturesData.length) && (
            <div className="flex items-center justify-center w-full h-40 text-sm uppercase">
              No results found
            </div>
          )}

          {!!selectedFeaturesData && selectedFeaturesData.length && (
            <div className="relative h-full overflow-hidden">
              <div className="absolute top-0 left-0 z-10 w-full h-6 bg-gradient-to-b from-gray-700 via-gray-700" />
              <div className="relative h-full px-0.5 py-6 overflow-x-visible overflow-y-auto">
                <FieldRFF name="features">
                  {({ input }) => (
                    <div>
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
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </FieldRFF>
              </div>
              <div className="absolute bottom-0 left-0 z-10 w-full h-6 bg-gradient-to-t from-gray-700 via-gray-700" />
            </div>
          )}

          {!!selectedFeaturesData && selectedFeaturesData.length && (
            <Button
              type="submit"
              theme="secondary-alt"
              size="lg"
            >
              Continue
            </Button>
          )}
        </form>
      )}
    </FormRFF>
  );
};

export default ScenariosFeaturesList;
