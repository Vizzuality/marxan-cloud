import React, { useCallback, useMemo, useState } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import { useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { ScenarioSidebarTabs, ScenarioSidebarSubTabs } from 'utils/tabs';
import { mergeScenarioStatusMetaData } from 'utils/utils-scenarios';

import {
  useAllFeatures, useSaveSelectedFeatures, useSelectedFeatures,
} from 'hooks/features';
import { useSaveScenario, useScenario } from 'hooks/scenarios';

import List from 'layout/scenarios/edit/features/add/list';
import Toolbar from 'layout/scenarios/edit/features/add/toolbar';

import Button from 'components/button';
import Icon from 'components/icon';
import Loading from 'components/loading';
import Modal from 'components/modal';

import PLUS_SVG from 'svgs/ui/plus.svg?sprite';

import Uploader from './uploader';

export interface ScenariosFeaturesAddProps { }

export const ScenariosFeaturesAdd: React.FC<ScenariosFeaturesAddProps> = () => {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState(null);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState(null);

  const dispatch = useDispatch();
  const { query } = useRouter();
  const { pid, sid } = query;

  const queryClient = useQueryClient();
  const scenarioSlice = getScenarioEditSlice(sid);

  const { setFeatures } = scenarioSlice.actions;

  const selectedFeaturesMutation = useSaveSelectedFeatures({});
  const saveScenarioMutation = useSaveScenario({
    requestConfig: {
      method: 'PATCH',
    },
  });

  const { data: scenarioData } = useScenario(sid);
  const { metadata } = scenarioData || {};

  const {
    data: initialSelectedFeatures,
  } = useSelectedFeatures(sid, {});

  const {
    data: allFeaturesData,
    isFetched: allFeaturesIsFetched,
  } = useAllFeatures(pid, {
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

  const onSubmit = useCallback(({ selected }) => {
    const selectedFeaturesData = allFeaturesData.filter((sf) => selected.includes(sf.id));

    setSubmitting(true);
    dispatch(setFeatures(selectedFeaturesData));

    // Save current features then dismiss the modal
    selectedFeaturesMutation.mutate({
      id: `${sid}`,
      data: {
        status: 'draft',
        features: selectedFeaturesData.map((feature) => {
          const { marxanSettings, geoprocessingOperations } = feature;

          return {
            featureId: feature.id,
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
            metadata: mergeScenarioStatusMetaData(metadata, {
              tab: ScenarioSidebarTabs.FEATURES,
              subtab: ScenarioSidebarSubTabs.FEATURES_PREVIEW,
            }),
          },
        }, {
          onSuccess: () => {
            setSubmitting(false);
            setOpen(false);
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
    allFeaturesData,
    selectedFeaturesMutation,
    saveScenarioMutation,
    setFeatures,
    dispatch,
  ]);

  return (
    <>
      <Button
        theme="primary"
        size="base"
        onClick={() => setOpen(true)}
      >
        <span className="mr-3">Add features</span>
        <Icon icon={PLUS_SVG} className="w-4 h-4" />
      </Button>

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

              {/* Field to upload */}
              <div className="mx-8 mt-3 mb-5">
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
