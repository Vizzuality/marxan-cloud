import React, { useCallback, useMemo, useState } from 'react';

import { useDropzone } from 'react-dropzone';
import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';

import { useRouter } from 'next/router';

import cx from 'classnames';
import { mergeScenarioStatusMetaData } from 'utils/utils-scenarios';

import {
  useAllFeatures, useSaveSelectedFeatures, useSelectedFeatures, useUploadFeaturesShapefile,
} from 'hooks/features';
import { useSaveScenario, useScenario } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';

import List from 'layout/scenarios/edit/features/add/list';
import Toolbar from 'layout/scenarios/edit/features/add/toolbar';

import Button from 'components/button';
import Icon from 'components/icon';
import Loading from 'components/loading';

import UPLOAD_SVG from 'svgs/ui/upload.svg?sprite';

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
  const [loading, setLoading] = useState(false);

  const { addToast } = useToasts();

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

  const uploadFeaturesShapefileMutation = useUploadFeaturesShapefile({
    requestConfig: {
      method: 'POST',
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

  const onFilters = useCallback((f) => {
    setFilters(f);
  }, []);

  const onSort = useCallback((s) => {
    setSort(s);
  }, []);

  const onDropAccepted = async (acceptedFiles) => {
    setLoading(true);
    const f = acceptedFiles[0];

    const data = new FormData();
    data.append('file', f);

    uploadFeaturesShapefileMutation.mutate({ data, id: `${pid}` }, {
      onSuccess: ({ data: { data: g, id: shapefileId } }) => {
        setLoading(false);

        addToast('success-upload-feature-shapefile', (
          <>
            <h2 className="font-medium">Success!</h2>
            <p className="text-sm">Shapefile uploaded</p>
          </>
        ), {
          level: 'success',
        });

        console.info('Shapefile uploaded', g, 'shapefileId', shapefileId);
      },
      onError: () => {
        setLoading(false);

        addToast('error-upload-feature-shapefile', (
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">Shapefile could not be uploaded</p>
          </>
        ), {
          level: 'error',
        });
      },
    });
  };

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

  const onDropRejected = (rejectedFiles) => {
    const r = rejectedFiles[0];
    const { errors } = r;

    addToast('drop-error', (
      <>
        <h2 className="font-medium">Error!</h2>
        <ul className="text-sm">
          {errors.map((e) => (
            <li key={`${e.code}`}>{e.message}</li>
          ))}
        </ul>
      </>
    ), {
      level: 'error',
    });
  };

  const {
    getRootProps,
    getInputProps,
    // isDragActive,
    // isDragAccept,
    // isDragReject,
  } = useDropzone({
    multiple: false,
    maxSize: 1000000,
    onDropAccepted,
    onDropRejected,
  });

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
            visible={submitting || loading}
            className="absolute top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center w-full h-full bg-white bg-opacity-90"
            iconClassName="w-10 h-10 text-primary-500"
          />

          {/* Field to upload */}
          <div className="mx-8 mt-3 mb-5">

            <Button
              {...getRootProps()}
              className={cx({
                'text-xs dropzone py-1 w-full hover:bg-gray-500 cursor-pointer': true,
                // 'bg-gray-500': isDragActive,
                // 'bg-green-800': isDragAccept,
                // 'bg-red-800': isDragReject,
              })}
              theme="secondary"
              size="base"
            >
              Upload your own features
              <Icon className="absolute w-4 h-4 text-white right-6" icon={UPLOAD_SVG} />

              <input {...getInputProps()} />

            </Button>

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
