import React, { useCallback, useMemo, useState } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';

import Button from 'components/button';

import Toolbar from 'layout/scenarios/sidebar/features/intersect/toolbar';
import List from 'layout/scenarios/sidebar/features/intersect/list';

import { useAllFeatures, useSelectedFeatures } from 'hooks/features';
import { useRouter } from 'next/router';

export interface ScenariosFeaturesIntersectProps {
  intersected: string;
  onSuccess?: () => void;
  onDismiss?: () => void;
}

export const ScenariosFeaturesIntersect: React.FC<ScenariosFeaturesIntersectProps> = ({
  intersected,
  onSuccess,
  onDismiss,
}: ScenariosFeaturesIntersectProps) => {
  const [search, setSearch] = useState(null);
  const { query } = useRouter();
  const { pid } = query;

  const {
    data: selectedFeaturesData,
  } = useSelectedFeatures({});

  const intersectedCurrent = selectedFeaturesData.find((s) => s.id === intersected);
  console.info(intersectedCurrent);

  const {
    isFetched: allFeaturesIsFetched,
  } = useAllFeatures(pid, {
    filters: {
      tag: 'bioregional',
    },
  });

  const INITIAL_VALUES = useMemo(() => {
    if (selectedFeaturesData) {
      return {
        selected: selectedFeaturesData.map((s) => s.id),
      };
    }

    return [];
  }, [selectedFeaturesData]);

  const onToggleSelected = useCallback((id, input) => {
    const { value, onChange } = input;
    const selected = [...value];

    const selectedIndex = selected.findIndex((f) => f === id);

    if (selectedIndex !== -1) {
      selected.splice(selectedIndex, 1);
    } else {
      selected.push(id);
    }

    onChange(selected);
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
      key="features-list"
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
                onToggleSelected={(id) => {
                  onToggleSelected(id, input);
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
