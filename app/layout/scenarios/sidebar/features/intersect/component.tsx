import React, { useCallback, useMemo, useState } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';

import Button from 'components/button';

import Toolbar from 'layout/scenarios/sidebar/features/intersect/toolbar';
import List from 'layout/scenarios/sidebar/features/intersect/list';

import { useAllFeatures, useSelectedFeatures } from 'hooks/features';
import { useRouter } from 'next/router';

export interface ScenariosFeaturesIntersectProps {
  intersecting: string;
  onSuccess?: () => void;
  onDismiss?: () => void;
}

export const ScenariosFeaturesIntersect: React.FC<ScenariosFeaturesIntersectProps> = ({
  intersecting,
  onSuccess,
  onDismiss,
}: ScenariosFeaturesIntersectProps) => {
  const [search, setSearch] = useState(null);
  const { query } = useRouter();
  const { pid, sid } = query;

  const {
    data: selectedFeaturesData,
  } = useSelectedFeatures(sid, {});

  const intersectingCurrent = selectedFeaturesData.find((s) => s.id === intersecting);
  console.info(intersectingCurrent);

  const {
    isFetched: allFeaturesIsFetched,
  } = useAllFeatures(pid, {
    search,
    filters: {
      tag: 'bioregional',
    },
  });

  const INITIAL_VALUES = useMemo(() => {
    if (intersectingCurrent) {
      return {
        selected: intersectingCurrent.splitFeaturesSelected || [],
      };
    }

    return [];
  }, [intersectingCurrent]);

  const onSelected = useCallback((feature, input) => {
    const { id } = feature;
    const { value, onChange } = input;
    const intersections = [...value];

    const intersectionsIndex = intersections.findIndex((f) => f.id === id);

    if (intersectionsIndex !== -1) {
      intersections.splice(intersectionsIndex, 1);
    } else {
      intersections.push(feature);
    }
    onChange(intersections);
  }, []);

  const onSplitSelected = useCallback((id, key, input) => {
    const { value, onChange } = input;
    const intersections = [...value];

    const feature = intersections.find((f) => f.id === id);
    const featureIndex = intersections.findIndex((f) => f.id === id);

    const { splitOptions } = feature;

    const splitFeaturesOptions = key ? splitOptions
      .find((s) => s.key === key).values
      .map((v) => ({ label: v.name, value: v.id }))
      : [];

    intersections[featureIndex] = {
      ...feature,
      splitSelected: key,
      splitFeaturesOptions,
      splitFeaturesSelected: splitFeaturesOptions.map((s) => ({
        id: s.value,
        name: s.label,
      })),
    };

    onChange(intersections);
  }, []);

  const onSplitFeaturesSelected = useCallback((id, key, input) => {
    const { value, onChange } = input;
    const intersections = [...value];

    const feature = intersections.find((f) => f.id === id);
    const featureIndex = intersections.findIndex((f) => f.id === id);

    intersections[featureIndex] = {
      ...feature,
      splitFeaturesSelected: key,
    };
    onChange(intersections);
  }, []);

  const onSearch = useCallback((s) => {
    setSearch(s);
  }, []);

  const onSubmit = useCallback((values) => {
    // Save current features then dismiss the modal
    console.info(values);
    onSuccess();
    onDismiss();
  }, [onSuccess, onDismiss]);

  const onCancel = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  return (
    <FormRFF
      key="features-intersect"
      onSubmit={onSubmit}
      initialValues={INITIAL_VALUES}
    >
      {({ handleSubmit, values }) => (
        <form onSubmit={handleSubmit} autoComplete="off" className="flex flex-col flex-grow overflow-hidden text-black">
          <h2 className="flex-shrink-0 pl-8 mb-5 text-lg pr-28 font-heading">
            Interesect with
            {' '}
            <span className="px-1 bg-green-300">bioregional</span>
            {' '}
            features
          </h2>
          <Toolbar search={search} onSearch={onSearch} />

          <FieldRFF
            name="selected"
          >
            {({ input }) => (
              <List
                search={search}
                selected={values.selected}
                onSelected={(id) => {
                  onSelected(id, input);
                }}
                onSplitSelected={(id, key) => {
                  onSplitSelected(id, key, input);
                }}
                onSplitFeaturesSelected={(id, key) => {
                  onSplitFeaturesSelected(id, key, input);
                }}
              />
            )}
          </FieldRFF>

          {allFeaturesIsFetched && (
            <div className="flex justify-center flex-shrink-0 px-8 space-x-3">
              <Button
                className="w-full"
                theme="secondary"
                size="lg"
                onClick={onCancel}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="w-full"
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

export default ScenariosFeaturesIntersect;
