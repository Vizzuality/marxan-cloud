import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';

import { PLANNING_UNIT_UPLOADER_MAX_SIZE } from 'constants/file-uploader-size-limits';
import { useDropzone } from 'react-dropzone';
import { Form as FormRFF } from 'react-final-form';
import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import cx from 'classnames';
import { bytesToMegabytes } from 'utils/units';

import { useSaveScenarioPU, useUploadScenarioPU } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import Icon from 'components/icon';
import InfoButton from 'components/info-button';
import Loading from 'components/loading';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';
import UPLOAD_SVG from 'svgs/ui/upload.svg?sprite';

export interface AnalysisAdjustUploadingProps {
  type: string;
  selected: boolean;
  onSelected: (s: string) => void;
}

export const AnalysisAdjustUploading: React.FC<AnalysisAdjustUploadingProps> = ({
  type,
  selected,
  onSelected,
}: AnalysisAdjustUploadingProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successFile, setSuccessFile] = useState(null);
  const { addToast } = useToasts();
  const { query } = useRouter();
  const { sid } = query;

  const scenarioSlice = getScenarioEditSlice(sid);
  const {
    setUploading,
    setUploadingValue,
    setJob,
  } = scenarioSlice.actions;

  const dispatch = useDispatch();

  const { uploadingValue, puIncludedValue, puExcludedValue } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

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

    uploadScenarioPUMutation.mutate({ id: `${sid}`, data }, {
      onSuccess: ({ data: { data: g } }) => {
        setLoading(false);
        setSuccessFile({ id: g.id, name: f.name });

        addToast('success-upload-shapefile', (
          <>
            <h2 className="font-medium">Success!</h2>
            <p className="text-sm">Shapefile uploaded</p>
          </>
        ), {
          level: 'success',
        });

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

        setLoading(false);
        setSuccessFile(null);

        addToast('error-upload-shapefile', (
          <>
            <h2 className="font-medium">Error!</h2>
            <ul className="text-sm">
              {errors.map((e) => (
                <li key={`${e.status}`}>{e.title}</li>
              ))}
            </ul>
          </>
        ), {
          level: 'error',
        });
      },
    });
  };

  const onDropRejected = (rejectedFiles) => {
    const r = rejectedFiles[0];

    // `file-too-large` backend error message is not friendly.
    // It'll display the max size in bytes which the average user may not understand.
    const errors = r.errors.map((error) => {
      return error.code === 'file-too-large'
        ? { error, message: `File is larger than ${bytesToMegabytes(PLANNING_UNIT_UPLOADER_MAX_SIZE)} MB` }
        : error;
    });

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
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    // accept: 'image/*',
    multiple: false,
    maxSize: PLANNING_UNIT_UPLOADER_MAX_SIZE,
    onDropAccepted,
    onDropRejected,
  });

  // Callbacks
  const onSubmit = useCallback((values) => {
    // const coordinates = [
    //   Object.values(values.uploadingValue.features[0][0]).filter((i) => Array.isArray(i)),
    // ];
    // const { properties } = values.uploadingValue.features[0][0];

    // console.log(coordinates, properties, values.uploadingValue);

    setSubmitting(true);
    // Save current uploaded shape
    scenarioPUMutation.mutate({
      id: `${sid}`,
      data: {
        byId: {
          include: puIncludedValue,
          exclude: puExcludedValue,
        },
        byGeoJson: {
          [values.type]: [
            values.uploadingValue,
          ],
        },
      },
    }, {
      onSuccess: ({ data: { meta } }) => {
        dispatch(setJob(new Date(meta.isoDate).getTime()));
        setSubmitting(false);
        onSelected(null);
        dispatch(setUploading(false));
        dispatch(setUploadingValue(null));
        setSuccessFile(null);

        addToast('adjust-planning-units-success', (
          <>
            <h2 className="font-medium">Success!</h2>
            <ul className="text-sm">
              <li>Planning units lock status saved</li>
            </ul>
          </>
        ), {
          level: 'success',
        });
      },
      onError: () => {
        setSubmitting(false);
        addToast('adjust-planning-units-error', (
          <>
            <h2 className="font-medium">Error!</h2>
            <ul className="text-sm">
              <li>Ooops! Something went wrong. Try again</li>
            </ul>
          </>
        ), {
          level: 'error',
        });
      },
    });
  }, [
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
  ]);

  return (
    <FormRFF
      key="uploading-form"
      onSubmit={onSubmit}
      initialValues={INITIAL_VALUES}
    >
      {({ handleSubmit }) => (
        <form onSubmit={handleSubmit} autoComplete="off">
          <div
            key="uploading"
            role="presentation"
            className={cx({
              'text-sm py-2.5 focus:outline-none relative transition rounded-3xl px-10 cursor-pointer': true,
              'bg-gray-600 text-gray-200 opacity-50': !selected,
              'bg-gray-600 text-white': selected,
            })}
            onClick={() => onSelected('uploading')}
          >
            <header className="relative flex justify-between w-full">
              <div
                className={cx({
                  'text-center': !selected,
                  'text-left': selected,
                })}
              >
                Upload shapefile
              </div>

              {!selected && (
                <Icon
                  className="absolute right-0 w-5 h-5 transform -translate-y-1/2 top-1/2"
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

                  <Button
                    type="submit"
                    theme="primary"
                    size="s"
                    disabled={submitting}
                  >
                    Save
                  </Button>
                  {/* <button
                    type="button"
                    className="flex items-center justify-center h-5 pl-5 pr-1 focus:outline-none"
                    onClickCapture={() => {
                      setSelected(null);
                    }}
                  >
                    <Icon
                      className="w-3 h-3 text-primary-500"
                      icon={ARROW_UP_SVG}
                    />
                  </button> */}
                </div>
              )}
            </header>

            <Loading
              visible={submitting}
              className="absolute top-0 left-0 z-40 flex items-center justify-center w-full h-full bg-gray-600 bg-opacity-90 rounded-3xl"
              iconClassName="w-10 h-5 text-primary-500"
            />

            {selected && (
              <>
                {!successFile && (
                  <div className="pt-2">
                    <div
                      {...getRootProps()}
                      className={cx({
                        'relative px-5 py-3 w-full border border-dotted hover:bg-gray-500 cursor-pointer': true,
                        'bg-gray-500': isDragActive,
                        'border-green-800': isDragAccept,
                        'border-red-800': isDragReject,
                      })}
                    >
                      <input {...getInputProps()} />

                      <p className="text-sm text-gray-300">
                        Drag and drop your
                        {' '}
                        <b>polygon data file</b>
                        {' '}
                        or click here to upload
                      </p>

                      <p className="mt-2 text-center text-gray-400 text-xxs">{`Recommended file size < ${bytesToMegabytes(PLANNING_UNIT_UPLOADER_MAX_SIZE)} MB`}</p>

                      <Loading
                        visible={loading}
                        className="absolute top-0 left-0 z-40 flex items-center justify-center w-full h-full bg-gray-600 bg-opacity-90"
                        iconClassName="w-10 h-5 text-primary-500"
                      />
                    </div>

                    <p className="flex items-center space-x-2 text-xs text-gray-300 mt-2.5">
                      <span>Learn more about supported file formats</span>

                      <InfoButton
                        theme="secondary"
                      >
                        <div className="text-sm">
                          <h3 className="font-semibold">List of supported file formats:</h3>

                          {/* eslint-disable max-len */}
                          <ul className="pl-4 mt-2 space-y-1 list-disc list-outside">
                            {/* <li>
                              Unzipped: .csv, .json, .geojson, .kml, .kmz (.csv files must contain a geom column of shape data converted to well known text (WKT) format).
                            </li> */}
                            <li>Zipped: .shp (zipped shapefiles must include .shp, .shx, .dbf, and .prj files)</li>
                          </ul>
                        </div>
                      </InfoButton>
                    </p>
                  </div>
                )}

                {successFile && (
                  <div>
                    <div className="flex items-center w-full py-5 space-x-8 cursor-pointer">
                      <div className="flex items-center space-x-2 ">
                        <label className="px-2.5 py-px bg-blue-500 bg-opacity-10 rounded-3xl" htmlFor="cancel-shapefile-btn">
                          <p className="text-sm text-blue-500">{successFile.name}</p>
                        </label>
                        <button
                          id="cancel-shapefile-btn"
                          type="button"
                          className="flex items-center justify-center w-5 h-5 border border-white rounded-full group hover:bg-white border-opacity-20"
                          onClick={() => {
                            setSuccessFile(null);
                          }}
                        >
                          <Icon
                            className="w-1.5 h-1.5 text-white group-hover:text-black"
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

export default AnalysisAdjustUploading;
