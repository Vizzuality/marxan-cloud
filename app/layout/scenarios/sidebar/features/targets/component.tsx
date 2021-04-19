import React, { useCallback, useMemo } from 'react';
import cx from 'classnames';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';

import Button from 'components/button';
import Loading from 'components/loading';
import Item from 'components/features/target-spf-item';

import { useSelectedFeatures } from 'hooks/features';

export interface ScenariosFeaturesListProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const ScenariosFeaturesList: React.FC<ScenariosFeaturesListProps> = ({
  onBack,
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
      key="features-target"
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
                              onChangeTarget={(v) => {
                                onChangeTarget(item.id, v, input);
                              }}
                              onChangeFPF={(v) => {
                                onChangeFPF(item.id, v, input);
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
            <div className="flex justify-center space-x-3">
              <Button
                type="button"
                theme="secondary"
                size="lg"
                onClick={onBack}
              >
                Back
              </Button>

              <Button
                type="submit"
                theme="primary"
                size="lg"
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
