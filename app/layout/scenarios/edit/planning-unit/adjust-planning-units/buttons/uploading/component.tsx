import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useDropzone } from 'react-dropzone';
import { Form as FormRFF } from 'react-final-form';
import { useSelector, useDispatch } from 'react-redux';

import cx from 'classnames';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { useSaveScenarioPU, useUploadScenarioPU } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import Icon from 'components/icon';
import InfoButton from 'components/info-button';
import Loading from 'components/loading';
import { PLANNING_UNIT_UPLOADER_MAX_SIZE } from 'constants/file-uploader-size-limits';
import { bytesToMegabytes } from 'utils/units';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';
import UPLOAD_SVG from 'svgs/ui/upload.svg?sprite';

export interface PlanningUnitUploadingProps {
  type: string;
  selected: boolean;
  onSelected: (s: string) => void;
}

export const PlanningUnitUploading: React.FC<PlanningUnitUploadingProps> = ({
  type,
  selected,
  onSelected,
}: PlanningUnitUploadingProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successFile, setSuccessFile] = useState(null);
  const { addToast } = useToasts();
  const { query } = useRouter();
  const { sid } = query;

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setUploading, setUploadingValue, setJob } = scenarioSlice.actions;

  const dispatch = useDispatch();

  const { uploadingValue, puIncludedValue, puExcludedValue } = useSelector(
    (state) => state[`/scenarios/${sid}/edit`]
  );

  const INITIAL_VALUES = useMemo(() => {
    return {
      type,
      uploadingValue,
    };
  }, [type, uploadingValue]);

  const uploadScenarioPUMutation = useUploadScenarioPU({
    requestConfig: {
      method: 'POST',
    },
  });

  const scenarioPUMutation = useSaveScenarioPU({});

  // Effects
  useEffect(() => {
    if (selected) {
      dispatch(setUploading(true));
    }

    if (!selected) {
      dispatch(setUploading(false));
      dispatch(setUploadingValue(null));
    }

    // Unmount
    return () => {
      setSuccessFile(null);
      dispatch(setUploading(false));
      dispatch(setUploadingValue(null));
    };
  }, [selected]); // eslint-disable-line

  const onDropAccepted = async (acceptedFiles) => {
    setLoading(true);
    const f = acceptedFiles[0];

    const data = new FormData();
    data.append('file', f);

    uploadScenarioPUMutation.mutate(
      { id: `${sid}`, data },
      {
        onSuccess: ({ data: { data: g } }) => {
          setSuccessFile({ id: g.id, name: f.name });

          addToast(
            'success-upload-shapefile',
            <>
              <h2 className="font-medium">Success!</h2>
              <p className="text-sm">Shapefile uploaded</p>
            </>,
            {
              level: 'success',
            }
          );

          const features = g.features.map((fe) => {
            if (fe?.geometry?.type === 'MultiPolygon') {
              const polygons = fe.geometry.coordinates.map((c) => {
                return {
                  type: 'Feature',
                  geometry: {
                    coordinates: c,
                    type: 'Polygon',
                  },
                  properties: fe.properties || {},
                };
              });

              return polygons;
            }

            return {
              ...fe,
              properties: fe.properties || {},
            };
          });

          const isMulti = features.every((fe) => {
            return Array.isArray(fe);
          });

          const validGeoJSON = {
            ...g,
            features: isMulti ? features.flat() : features,
          };

          dispatch(setUploadingValue(validGeoJSON));
          console.info('Shapefile uploaded', g);
        },
        onError: ({ response }) => {
          const { errors } = response.data;

          setSuccessFile(null);

          addToast(
            'error-upload-shapefile',
            <>
              <h2 className="font-medium">Error!</h2>
              <ul className="text-sm">
                {errors.map((e) => (
                  <li key={`${e.status}`}>{e.title}</li>
                ))}
              </ul>
            </>,
            {
              level: 'error',
            }
          );
        },
        onSettled: () => {
          setLoading(false);
        },
      }
    );
  };

  const onDropRejected = (rejectedFiles) => {
    const r = rejectedFiles[0];

    // `file-too-large` backend error message is not friendly.
    // It'll display the max size in bytes which the average user may not understand.
    const errors = r.errors.map((error) => {
      return error.code === 'file-too-large'
        ? {
            error,
            message: `File is larger than ${bytesToMegabytes(PLANNING_UNIT_UPLOADER_MAX_SIZE)} MB`,
          }
        : error;
    });

    addToast(
      'drop-error',
      <>
        <h2 className="font-medium">Error!</h2>
        <ul className="text-sm">
          {errors.map((e) => (
            <li key={`${e.code}`}>{e.message}</li>
          ))}
        </ul>
      </>,
      {
        level: 'error',
      }
    );
  };

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    // accept: 'image/*',
    multiple: false,
    maxSize: PLANNING_UNIT_UPLOADER_MAX_SIZE,
    onDropAccepted,
    onDropRejected,
  });

  // Callbacks
  const onSubmit = useCallback(
    (values) => {
      // const coordinates = [
      //   Object.values(values.uploadingValue.features[0][0]).filter((i) => Array.isArray(i)),
      // ];
      // const { properties } = values.uploadingValue.features[0][0];

      // console.log(coordinates, properties, values.uploadingValue);

      setSubmitting(true);
      // Save current uploaded shape
      scenarioPUMutation.mutate(
        {
          id: `${sid}`,
          data: {
            byId: {
              include: puIncludedValue,
              exclude: puExcludedValue,
            },
            byGeoJson: {
              [values.type]: [values.uploadingValue],
            },
          },
        },
        {
          onSuccess: ({ data: { meta } }) => {
            dispatch(setJob(new Date(meta.isoDate).getTime()));
            onSelected(null);
            dispatch(setUploading(false));
            dispatch(setUploadingValue(null));
            setSuccessFile(null);

            addToast(
              'adjust-planning-units-success',
              <>
                <h2 className="font-medium">Success!</h2>
                <ul className="text-sm">
                  <li>Planning units lock status saved</li>
                </ul>
              </>,
              {
                level: 'success',
              }
            );
          },
          onError: () => {
            addToast(
              'adjust-planning-units-error',
              <>
                <h2 className="font-medium">Error!</h2>
                <ul className="text-sm">
                  <li>Ooops! Something went wrong. Try again</li>
                </ul>
              </>,
              {
                level: 'error',
              }
            );
          },
          onSettled: () => {
            setSubmitting(false);
          },
        }
      );
    },
    [
      sid,
      scenarioPUMutation,
      puIncludedValue,
      puExcludedValue,
      onSelected,
      dispatch,
      setUploading,
      setUploadingValue,
      setJob,
      addToast,
    ]
  );

  return (
    <FormRFF key="uploading-form" onSubmit={onSubmit} initialValues={INITIAL_VALUES}>
      {({ handleSubmit }) => (
        <form onSubmit={handleSubmit} autoComplete="off">
          <div
            key="uploading"
            role="presentation"
            className={cx({
              'relative cursor-pointer rounded-3xl px-10 py-2.5 text-sm transition focus:outline-none':
                true,
              'bg-gray-600 text-gray-200 opacity-50': !selected,
              'bg-gray-600 text-white': selected,
            })}
            onClick={() => onSelected('uploading')}
          >
            <header className="relative flex w-full justify-between">
              <div className="mb-5 flex items-center space-x-3">
                <div
                  className={cx({
                    'text-center': !selected,
                    'text-left': selected,
                  })}
                >
                  Upload shapefile
                </div>
                <InfoButton size="base" theme="secondary">
                  <span className="text-xs">
                    {' '}
                    <h4 className="mb-2.5 font-heading">
                      When uploading any shapefile, please make sure that:
                    </h4>
                    <ul className="list-disc space-y-1 pl-6">
                      <li>
                        this is a single zip file that includes all the components of a single
                        shapefile;
                      </li>
                      <li>
                        all the components are added to the “root”/top-level of the zip file itself
                        (that is, not within any folder within the zip file);
                      </li>
                      <li>
                        user-defined shapefile attributes are only considered for shapefiles of
                        features, while they are ignored for any other kind of shapefile (planning
                        grid, lock-in/out, etc), so you may consider excluding any attributes from
                        shapefiles other than for features, in order to keep the shapefile’s file
                        size as small as possible.
                      </li>
                    </ul>
                  </span>
                </InfoButton>
              </div>
              {!selected && (
                <Icon
                  className="absolute right-0 top-1/2 h-5 w-5 -translate-y-1/2 transform"
                  icon={UPLOAD_SVG}
                />
              )}

              {selected && (
                <div className="flex items-center space-x-3 divide-x-2">
                  <Button
                    theme="secondary-alt"
                    size="s"
                    onClickCapture={() => {
                      onSelected(null);
                    }}
                  >
                    Cancel
                  </Button>

                  <Button type="submit" theme="primary" size="s" disabled={submitting}>
                    Save
                  </Button>
                </div>
              )}
            </header>

            <Loading
              visible={submitting}
              className="absolute left-0 top-0 z-40 flex h-full w-full items-center justify-center rounded-3xl bg-gray-600 bg-opacity-90"
              iconClassName="w-10 h-5 text-primary-500"
            />

            {selected && (
              <>
                {!successFile && (
                  <div className="pt-2">
                    <div
                      {...getRootProps()}
                      className={cx({
                        'relative w-full cursor-pointer border border-dotted px-5 py-3 hover:bg-gray-500':
                          true,
                        'bg-gray-500': isDragActive,
                        'border-green-800': isDragAccept,
                        'border-red-800': isDragReject,
                      })}
                    >
                      <input {...getInputProps()} />

                      <p className="text-sm text-gray-300">
                        Drag and drop your <b>polygon data file</b> or click here to upload
                      </p>

                      <p className="mt-2 text-center text-xxs text-gray-400">{`Recommended file size < ${bytesToMegabytes(
                        PLANNING_UNIT_UPLOADER_MAX_SIZE
                      )} MB`}</p>

                      <Loading
                        visible={loading}
                        className="absolute left-0 top-0 z-40 flex h-full w-full items-center justify-center bg-gray-600 bg-opacity-90"
                        iconClassName="w-10 h-5 text-primary-500"
                      />
                    </div>

                    <p className="mt-2.5 flex items-center space-x-2 text-xs text-gray-300">
                      <span>Learn more about supported file formats</span>

                      <InfoButton theme="secondary">
                        <div className="text-sm">
                          <h3 className="font-semibold">List of supported file formats:</h3>

                          {/* eslint-disable max-len */}
                          <ul className="mt-2 list-outside list-disc space-y-1 pl-4">
                            {/* <li>
                              Unzipped: .csv, .json, .geojson, .kml, .kmz (.csv files must contain a geom column of shape data converted to well known text (WKT) format).
                            </li> */}
                            <li>
                              Zipped: .shp (zipped shapefiles must include .shp, .shx, .dbf, and
                              .prj files)
                            </li>
                          </ul>
                        </div>
                      </InfoButton>
                    </p>
                  </div>
                )}

                {successFile && (
                  <div>
                    <div className="flex w-full cursor-pointer items-center space-x-8 py-5">
                      <div className="flex items-center space-x-2 ">
                        <label
                          className="rounded-3xl bg-blue-500 bg-opacity-10 px-2.5 py-px"
                          htmlFor="cancel-shapefile-btn"
                        >
                          <p className="text-sm text-blue-500">{successFile.name}</p>
                        </label>
                        <button
                          id="cancel-shapefile-btn"
                          type="button"
                          className="group flex h-5 w-5 items-center justify-center rounded-full border border-white border-opacity-20 hover:bg-white"
                          onClick={() => {
                            setSuccessFile(null);
                          }}
                        >
                          <Icon
                            className="h-1.5 w-1.5 text-white group-hover:text-black"
                            icon={CLOSE_SVG}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </form>
      )}
    </FormRFF>
  );
};

export default PlanningUnitUploading;
