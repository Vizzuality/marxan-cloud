import React, { useCallback, useMemo, useState } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import { useQueryClient } from 'react-query';

import { useRouter } from 'next/router';

import { useAllFeatures, useSaveSelectedFeatures, useSelectedFeatures } from 'hooks/features';
import { useCanEditScenario } from 'hooks/permissions';
import { useSaveScenario, useScenario } from 'hooks/scenarios';

import Button from 'components/button';
import Icon from 'components/icon';
import Loading from 'components/loading';
import Modal from 'components/modal';
import List from 'layout/scenarios/edit/features/set-up/add/add-modal/list';
import Toolbar from 'layout/scenarios/edit/features/set-up/add/add-modal/toolbar';
import { ScenarioSidebarTabs, ScenarioSidebarSubTabs } from 'utils/tabs';
import { mergeScenarioStatusMetaData } from 'utils/utils-scenarios';

import PLUS_SVG from 'svgs/ui/plus.svg?sprite';

import Uploader from './uploader';

export interface ScenariosFeaturesAddProps {}

export const ScenariosFeaturesAdd: React.FC<ScenariosFeaturesAddProps> = () => {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState(null);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState('featureClassName');

  const { query } = useRouter();
  const { pid, sid } = query;

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

  const { data: initialSelectedFeatures } = useSelectedFeatures(sid, {});

  const { isFetched: allFeaturesIsFetched } = useAllFeatures(pid, {
    search,
    filters,
    sort,
  });

  const INITIAL_VALUES = useMemo(() => {
    if (initialSelectedFeatures) {
      return {
        selected: initialSelectedFeatures.map((s) => s.id),
      };
    }

    return [];
  }, [initialSelectedFeatures]);

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

  const onSubmit = useCallback(
    ({ selected }) => {
      setSubmitting(true);

      // Save current features then dismiss the modal
      selectedFeaturesMutation.mutate(
        {
          id: `${sid}`,
          data: {
            status: 'draft',
            features: selected.map((fId) => {
              const initialFeature = initialSelectedFeatures.find((f) => f.id === fId) || {};
              const { marxanSettings, geoprocessingOperations } = initialFeature;

              return {
                featureId: fId,
                kind: geoprocessingOperations ? 'withGeoprocessing' : 'plain',
                ...(!geoprocessingOperations && {
                  marxanSettings: marxanSettings || {
                    fpf: 1,
                    prop: 0.5,
                  },
                }),
                ...(!!geoprocessingOperations && { geoprocessingOperations }),
              };
            }),
          },
        },
        {
          onSuccess: () => {
            saveScenarioMutation.mutate(
              {
                id: `${sid}`,
                data: {
                  metadata: mergeScenarioStatusMetaData(metadata, {
                    tab: ScenarioSidebarTabs.FEATURES,
                    subtab: ScenarioSidebarSubTabs.FEATURES_ADD,
                  }),
                },
              },
              {
                onSuccess: () => {
                  setSubmitting(false);
                  setOpen(false);
                },
                onError: () => {
                  setSubmitting(false);
                },
              }
            );
          },
          onError: () => {
            setSubmitting(false);
          },
        }
      );
    },
    [sid, metadata, initialSelectedFeatures, selectedFeaturesMutation, saveScenarioMutation]
  );

  return (
    <>
      {editable && (
        <Button theme="primary" size="base" onClick={() => setOpen(true)}>
          <span className="mr-3">Add features</span>
          <Icon icon={PLUS_SVG} className="h-4 w-4" />
        </Button>
      )}

      <Modal
        id="all-feaures"
        title="All features"
        open={open}
        size="narrow"
        onDismiss={() => {
          setOpen(false);
          queryClient.removeQueries(['all-features', pid]);
        }}
      >
        <FormRFF key="features-list" onSubmit={onSubmit} initialValues={INITIAL_VALUES}>
          {({ handleSubmit, values }) => (
            <form
              onSubmit={handleSubmit}
              autoComplete="off"
              className="flex flex-grow flex-col overflow-hidden text-black"
            >
              <h2 className="mb-5 flex-shrink-0 pl-8 pr-28 font-heading text-lg">
                Add features to your planning area
              </h2>

              <Loading
                visible={submitting}
                className="absolute bottom-0 left-0 right-0 top-0 z-40 flex h-full w-full items-center justify-center bg-white bg-opacity-90"
                iconClassName="w-10 h-10 text-primary-500"
              />

              {/* Field to upload */}
              <div className="mx-8 mb-5 mt-3">
                <Uploader />
              </div>

              <Toolbar
                search={search}
                filters={filters}
                sort={sort}
                onSearch={onSearch}
                onFilters={onFilters}
                onSort={onSort}
              />

              <FieldRFF name="selected">
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
                <div className="flex flex-shrink-0 justify-center space-x-3 px-8">
                  <Button
                    className="w-full"
                    theme="secondary"
                    size="lg"
                    onClick={() => setOpen(false)}
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
      </Modal>
    </>
  );
};

export default ScenariosFeaturesAdd;
