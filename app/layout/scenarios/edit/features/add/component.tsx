import React, { useCallback, useMemo, useState } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';

import { useRouter } from 'next/router';

import { mergeScenarioStatusMetaData } from 'utils/utils-scenarios';

import { useAllFeatures, useSaveSelectedFeatures, useSelectedFeatures } from 'hooks/features';
import { useSaveScenario, useScenario } from 'hooks/scenarios';

import List from 'layout/scenarios/edit/features/add/list';
import Toolbar from 'layout/scenarios/edit/features/add/toolbar';

import Button from 'components/button';
import Loading from 'components/loading';

export interface ScenariosFeaturesAddProps {
  onSuccess?: () => void;
  onDismiss?: () => void;
}

export const ScenariosFeaturesAdd: React.FC<ScenariosFeaturesAddProps> = ({
  onDismiss,
}: ScenariosFeaturesAddProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState(null);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState(null);
  const { query } = useRouter();
  const { pid, sid } = query;

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
  } = useSelectedFeatures(sid, {});

  const {
    isFetched: allFeaturesIsFetched,
  } = useAllFeatures(pid, {
    search,
    filters,
    sort,
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

  const onFilters = useCallback((f) => {
    setFilters(f);
  }, []);

  const onSort = useCallback((s) => {
    setSort(s);
  }, []);

  const onSubmit = useCallback((values) => {
    const { selected } = values;

    setSubmitting(true);

    // Save current features then dismiss the modal
    selectedFeaturesMutation.mutate({
      id: `${sid}`,
      data: {
        status: 'draft',
        features: selected.map((s) => {
          const {
            marxanSettings,
            geoprocessingOperations,
          } = selectedFeaturesData.find((sf) => sf.featureId === s) || {};

          return {
            featureId: s,
            kind: geoprocessingOperations ? 'withGeoprocessing' : 'plain',
            marxanSettings: marxanSettings || {
              fpf: 1,
              prop: 0.5,
            },
            ...!!geoprocessingOperations && { geoprocessingOperations },
          };
        }),
      },
    }, {
      onSuccess: () => {
        saveScenarioMutation.mutate({
          id: `${sid}`,
          data: {
            metadata: mergeScenarioStatusMetaData(metadata, { tab: 'features', subtab: 'features-preview' }),
          },
        }, {
          onSuccess: () => {
            onDismiss();
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
  }, [sid,
    metadata,
    selectedFeaturesData,
    selectedFeaturesMutation,
    saveScenarioMutation,
    onDismiss,
  ]);

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
          <h2 className="flex-shrink-0 pl-8 mb-5 text-lg pr-28 font-heading">Add features to your planning area</h2>

          <Loading
            visible={submitting}
            className="absolute top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center w-full h-full bg-white bg-opacity-90"
            iconClassName="w-10 h-10 text-primary-500"
          />

          <Toolbar
            search={search}
            filters={filters}
            sort={sort}
            onSearch={onSearch}
            onFilters={onFilters}
            onSort={onSort}
          />

          <FieldRFF
            name="selected"
          >
            {({ input }) => (
              <List
                search={search}
                filters={filters}
                sort={sort}
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

export default ScenariosFeaturesAdd;
