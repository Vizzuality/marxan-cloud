import { ChangeEvent, ComponentProps, useCallback, useMemo, useState } from 'react';

import { useQueryClient } from 'react-query';

import { useRouter } from 'next/router';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import Fuse from 'fuse.js';
import { useDebouncedCallback } from 'use-debounce';

import { useAllFeatures, useSaveSelectedFeatures, useSelectedFeatures } from 'hooks/features';
import { useCanEditScenario } from 'hooks/permissions';

import Button from 'components/button';
import ConfirmationPrompt from 'components/confirmation-prompt';
import Icon from 'components/icon';
import InfoButton from 'components/info-button';
import Search from 'components/search';
import FeaturesInfo from 'layout/project/sidebar/project/inventory-panel/features/info';
import AddFeaturesModal from 'layout/project/sidebar/scenario/grid-setup/features/add/add-modal';
import TargetsSPFTable from 'layout/project/sidebar/scenario/grid-setup/features/target-spf/targets-spf-table';
import ActionsMenu from 'layout/project/sidebar/scenario/grid-setup/features/target-spf/targets-spf-table/actions-menu';
import Section from 'layout/section';
import { Feature } from 'types/api/feature';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

import AllTargetsSelector from './all-targets';
import FeaturesBulkActionMenu from './bulk-action-menu';

const TARGET_SPF_TABLE_COLUMNS = [
  {
    name: 'name',
    text: 'Name',
  },
  {
    name: 'type',
    text: 'Type',
  },
] satisfies ComponentProps<typeof TargetsSPFTable>['columns'];

const TargetAndSPFFeatures = (): JSX.Element => {
  const queryClient = useQueryClient();
  const { query } = useRouter();
  const { pid, sid } = query as { pid: string; sid: string };
  const editable = useCanEditScenario(pid, sid);
  const [filters, setFilters] = useState({
    sort: TARGET_SPF_TABLE_COLUMNS[0].name,
    search: null,
    type: null,
  });
  const [featureValues, setFeatureValues] = useState<
    Record<
      string,
      {
        target: number;
        spf: number;
      }
    >
  >({});
  const [confirmationTarget, setConfirmationTarget] = useState<number>(null);
  const [confirmationFPF, setConfirmationFPF] = useState<number>(null);
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<Feature['id'][]>([]);
  const selectedFeaturesMutation = useSaveSelectedFeatures({});

  const dispatch = useAppDispatch();

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setSelectedFeatures, setSelectedContinuousFeatures, setLayerSettings } =
    scenarioSlice.actions;
  const { selectedFeatures, selectedContinuousFeatures } = useAppSelector(
    (state) => state[`/scenarios/${sid}/edit`]
  );

  const allFeaturesQuery = useAllFeatures(
    pid,
    {},
    {
      select: (data) => data?.data,
    }
  );

  const selectedFeaturesQuery = useSelectedFeatures(sid, filters, {
    keepPreviousData: true,
  });

  const targedtedFeatures = useMemo(() => {
    let parsedData = [];
    selectedFeaturesQuery.data?.forEach((feature) => {
      if (feature.splitFeaturesSelected?.length > 0) {
        const featureMetadata = allFeaturesQuery.data?.find(({ id }) => id === feature.id);

        const splitFeatures = feature.splitFeaturesSelected.map((splitFeature) => ({
          ...splitFeature,
          id: feature.id,
          parentId: feature.id,
          name: `${feature.name} / ${splitFeature.name}`,
          isVisibleOnMap: [...selectedFeatures, ...selectedContinuousFeatures].includes(feature.id),
          color: feature.color,
          amountRange: feature.amountRange,
          isCustom: feature.metadata?.isCustom,
          scenarioUsageCount: featureMetadata?.scenarioUsageCount,
          type: featureMetadata?.tag,
          splitted: true,
          marxanSettings: {
            ...splitFeature.marxanSettings,
            prop: (feature.marxanSettings?.prop || 50) * 100,
            ...(featureValues[splitFeature.id]?.target && {
              prop: featureValues[splitFeature.id].target,
            }),
            ...(featureValues[splitFeature.id]?.spf && {
              fpf: featureValues[splitFeature.id].spf,
            }),
          },
        }));

        parsedData = [...parsedData, ...splitFeatures];
      } else {
        const featureMetadata = allFeaturesQuery.data?.find(({ id }) => id === feature.id);

        parsedData = [
          ...parsedData,
          {
            ...feature,
            isVisibleOnMap: [...selectedFeatures, ...selectedContinuousFeatures].includes(
              feature.id
            ),
            isCustom: feature.metadata?.isCustom,
            scenarioUsageCount: featureMetadata?.scenarioUsageCount,
            type: featureMetadata?.tag,
            marxanSettings: {
              ...feature.marxanSettings,
              prop: (feature.marxanSettings?.prop || 50) * 100,
              ...(featureValues[feature.id]?.target && {
                prop: featureValues[feature.id].target,
              }),
              ...(featureValues[feature.id]?.spf && { fpf: featureValues[feature.id].spf }),
            },
          },
        ];
      }
    });

    if (filters.sort) {
      parsedData.sort((a, b) => {
        if (filters.sort.startsWith('-')) {
          const _sort = filters.sort.substring(1);
          return b[_sort]?.localeCompare(a[_sort]);
        }

        return a[filters.sort]?.localeCompare(b[filters.sort]);
      });
    }

    if (filters.type) {
      const fuse = new Fuse(parsedData, {
        keys: ['type'],
        threshold: 0.25,
      });

      parsedData = fuse.search(filters.type).map((f) => {
        return f.item;
      });
    }

    return parsedData;
  }, [
    selectedFeaturesQuery.data,
    allFeaturesQuery.data,
    filters,
    featureValues,
    selectedContinuousFeatures,
    selectedFeatures,
  ]);

  const handleSearch = useDebouncedCallback(
    (value: Parameters<ComponentProps<typeof Search>['onChange']>[0]) => {
      setFilters((prevFilters) => ({
        ...prevFilters,
        search: value,
      }));
    },
    500
  );

  const handleSort = useCallback(
    (_sortType: (typeof filters)['sort']) => {
      const sort = filters.sort === _sortType ? `-${_sortType}` : _sortType;
      setFilters((prevFilters) => ({
        ...prevFilters,
        sort,
      }));
    },
    [filters.sort]
  );

  const handleTagFilter = useCallback((type: Feature['tag']) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      type,
    }));
  }, []);

  const handleChangeAllTargets = useCallback(
    (target: Parameters<ComponentProps<typeof AllTargetsSelector>['onChangeAllTargets']>[0]) => {
      setConfirmationTarget(target);
    },
    []
  );

  const handleChangeAllSPF = useCallback(
    (spf: Parameters<ComponentProps<typeof AllTargetsSelector>['onChangeAllSPF']>[0]) => {
      setConfirmationFPF(spf);
    },
    []
  );

  const toggleSeeOnMap = useCallback(
    (id: Feature['id']) => {
      const binaryFeatures = [...selectedFeatures];
      const continuousFeatures = [...selectedContinuousFeatures];

      const selectedFeature = targedtedFeatures.find(({ id: featureId }) => featureId === id);
      const isContinuous =
        selectedFeature.amountRange.min !== null && selectedFeature.amountRange.max !== null;

      const _id = selectedFeature.splitted ? selectedFeature.parentId : selectedFeature.id;

      const isIncludedInBinary = binaryFeatures.includes(_id);
      const isIncludedInContinuous = continuousFeatures.includes(_id);

      if (isContinuous) {
        if (!isIncludedInContinuous) {
          continuousFeatures.push(_id);
        } else {
          const i = continuousFeatures.indexOf(_id);
          continuousFeatures.splice(i, 1);
        }

        dispatch(setSelectedContinuousFeatures(continuousFeatures));
      } else {
        if (!isIncludedInBinary) {
          binaryFeatures.push(_id);
        } else {
          const i = binaryFeatures.indexOf(_id);
          binaryFeatures.splice(i, 1);
        }
        dispatch(setSelectedFeatures(binaryFeatures));
      }

      dispatch(
        setLayerSettings({
          id: _id,
          settings: {
            visibility: !(isIncludedInBinary || isIncludedInContinuous),
            color: selectedFeature?.color,
            ...(isContinuous && {
              amountRange: selectedFeature.amountRange,
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
      targedtedFeatures,
    ]
  );

  const onApplyAllTargets = useCallback(() => {
    setFeatureValues((prevValues) => {
      const ids = targedtedFeatures.map(({ id }) => id);

      return ids.reduce(
        (acc, featureId) => ({
          ...acc,
          [featureId]: {
            ...prevValues[featureId],
            target: confirmationTarget,
          },
        }),
        {}
      );
    });
    setConfirmationTarget(null);
  }, [confirmationTarget, targedtedFeatures]);

  const onApplyAllSPF = useCallback(() => {
    setFeatureValues((prevValues) => {
      const ids = targedtedFeatures.map(({ id }) => id);

      return ids.reduce(
        (acc, featureId) => ({
          ...acc,
          [featureId]: {
            ...prevValues[featureId],
            spf: confirmationFPF,
          },
        }),
        {}
      );
    });
    setConfirmationFPF(null);
  }, [confirmationFPF, targedtedFeatures]);

  const handleSelectAllFeatures = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => {
      if (evt.target.checked) {
        setSelectedFeatureIds(targedtedFeatures.map(({ id }) => id));
      } else {
        setSelectedFeatureIds([]);
      }
    },
    [targedtedFeatures]
  );

  const handleSelectFeature = useCallback((evt: ChangeEvent<HTMLInputElement>) => {
    if (evt.target.checked) {
      setSelectedFeatureIds((prevFeatureIds) => [...prevFeatureIds, evt.target.value]);
    } else {
      setSelectedFeatureIds((prevFeatureIds) =>
        prevFeatureIds.filter((featureId) => featureId !== evt.target.value)
      );
    }
  }, []);

  const onSubmit = useCallback(() => {
    const data = {
      status: 'created',
      features: selectedFeaturesQuery.data.map((sf) => {
        const { featureId, kind, geoprocessingOperations } = sf;

        if (kind === 'withGeoprocessing') {
          return {
            featureId,
            kind,
            geoprocessingOperations: geoprocessingOperations.map((go) => {
              const { splits } = go;

              return {
                ...go,
                splits: splits
                  .filter((s) => {
                    return targedtedFeatures.find((f) => {
                      return f.parentId === featureId && f.value === s.value;
                    });
                  })
                  .map((s) => {
                    const {
                      marxanSettings: { prop, fpf },
                    } = targedtedFeatures.find((f) => {
                      return f.parentId === featureId && f.value === s.value;
                    });

                    return {
                      ...s,
                      marxanSettings: {
                        prop: prop / 100,
                        fpf,
                      },
                    };
                  }),
              };
            }),
          };
        }

        const { target, spf = 1 } = featureValues[featureId] || {};
        return {
          featureId,
          kind,
          marxanSettings: {
            prop: target / 100 || 0.5,
            fpf: spf,
          },
        };
      }),
    };

    selectedFeaturesMutation.mutate(
      {
        id: sid,
        data,
      },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries(['selected-features', sid]);
        },
      }
    );
  }, [
    sid,
    queryClient,
    selectedFeaturesMutation,
    featureValues,
    selectedFeaturesQuery.data,
    targedtedFeatures,
  ]);

  const handleRowValues = useCallback((id, values) => {
    setFeatureValues((prevValues) => ({
      ...prevValues,
      [id]: {
        ...prevValues[id],
        ...values,
      },
    }));
  }, []);

  const handleRowDeletion = useCallback(
    (id) => {
      selectedFeaturesMutation.mutate(
        {
          id: `${sid}`,
          data: {
            status: 'draft',
            features: selectedFeaturesQuery.data
              .filter(({ id: featureId }) => featureId !== id)
              .map(
                ({
                  metadata,
                  id,
                  name,
                  description,
                  amountRange,
                  color,
                  splitOptions,
                  splitFeaturesSelected,
                  splitFeaturesOptions,
                  intersectFeaturesSelected,
                  splitSelected,
                  ...sf
                }) => ({
                  ...sf,
                })
              ),
          },
        },
        {
          onSuccess: async () => {
            await queryClient.invalidateQueries(['selected-features', sid]);
          },
        }
      );
    },
    [selectedFeaturesQuery.data, queryClient, sid, selectedFeaturesMutation]
  );

  const displayBulkActions = selectedFeatureIds.length > 0;
  const displaySaveButton = selectedFeaturesQuery.data?.length > 0;

  return (
    <>
      <Section className="relative flex flex-col space-y-4 overflow-hidden">
        <header className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-blue-500">Grid setup</span>
            <h3 className="flex items-center space-x-2">
              <span className="text-lg font-medium">Features</span>
              <InfoButton theme="primary" className="bg-gray-400">
                <FeaturesInfo />
              </InfoButton>
            </h3>
          </div>
          <AddFeaturesModal />
        </header>
        <Search
          id="target-spf-search"
          size="sm"
          placeholder="Search features"
          aria-label="Search features"
          onChange={handleSearch}
          theme="dark"
        />
        {filters.type && (
          <div className="flex items-center space-x-2 text-xs">
            <span className=" space-x-3">
              <span>Filtering by: </span>
              <button
                type="button"
                className="inline-block rounded-2xl bg-yellow-500/10 px-3 py-0.5 text-yellow-500 transition-colors hover:bg-yellow-500 hover:text-gray-900"
                onClick={() => handleTagFilter(null)}
              >
                {filters.type}
              </button>
            </span>
            <button
              type="button"
              className="group inline-flex justify-center rounded-full border border-gray-400 p-1 transition-colors hover:border-transparent"
              onClick={() => handleTagFilter(null)}
            >
              <Icon
                icon={CLOSE_SVG}
                className="inline-block h-2 w-2 text-gray-400 transition-colors group-hover:text-white"
              />
            </button>
          </div>
        )}

        {/* set target/spf all features */}
        <AllTargetsSelector
          onChangeAllTargets={handleChangeAllTargets}
          onChangeAllSPF={handleChangeAllSPF}
        />

        <div className="flex h-full flex-col overflow-hidden">
          <TargetsSPFTable
            loading={selectedFeaturesQuery.isFetching}
            data={targedtedFeatures}
            noDataMessage="No features found"
            columns={TARGET_SPF_TABLE_COLUMNS}
            sorting={filters.sort}
            selectedIds={selectedFeatureIds}
            onSortChange={handleSort}
            onSelectAll={handleSelectAllFeatures}
            onSelectRow={handleSelectFeature}
            onSplitFeature={() => {}}
            onToggleSeeOnMap={(id) => {
              toggleSeeOnMap(id);
            }}
            onSelectTag={handleTagFilter}
            ActionsComponent={ActionsMenu}
            onChangeRow={handleRowValues}
            onDeleteRow={handleRowDeletion}
          />
        </div>
        {displaySaveButton && (
          <Button
            theme="primary"
            size="lg"
            type="button"
            className="relative px-20"
            onClick={onSubmit}
            disabled={!editable}
          >
            <span>Save</span>
          </Button>
        )}
        {displayBulkActions && (
          <FeaturesBulkActionMenu
            features={targedtedFeatures}
            selectedFeatureIds={selectedFeatureIds}
            onDone={() => {
              setSelectedFeatureIds([]);
            }}
          />
        )}
      </Section>
      <ConfirmationPrompt
        title={`Are you sure you want to change all feature targets to ${confirmationTarget}?`}
        description="The action cannot be reverted."
        open={!!confirmationTarget}
        onAccept={onApplyAllTargets}
        onDismiss={() => {}}
      />
      <ConfirmationPrompt
        title={`Are you sure you want to change all feature SPFs to ${confirmationFPF}?`}
        description="The action cannot be reverted."
        open={!!confirmationFPF}
        onAccept={onApplyAllSPF}
        onRefuse={() => setConfirmationFPF(null)}
        onDismiss={() => {}}
      />
    </>
  );
};

export default TargetAndSPFFeatures;
