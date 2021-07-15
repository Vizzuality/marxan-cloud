import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';

import cx from 'classnames';

import Button from 'components/button';
import InfoButton from 'components/info-button';
import Icon from 'components/icon';

import { Form as FormRFF } from 'react-final-form';

import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { getScenarioSlice } from 'store/slices/scenarios/edit';

import { useDropzone } from 'react-dropzone';
import { useToasts } from 'hooks/toast';
import { useSaveScenarioPU, useUploadScenarioPU } from 'hooks/scenarios';

import UPLOAD_SVG from 'svgs/ui/upload.svg?sprite';
import Loading from 'components/loading';

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
  const [loading, setLoading] = useState(false);
  const { addToast } = useToasts();
  const { query } = useRouter();
  const { sid } = query;

  const scenarioSlice = getScenarioSlice(sid);
  const { setUploading, setUploadingValue } = scenarioSlice.actions;

  const dispatch = useDispatch();
  const { uploadingValue } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

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

        addToast('success-upload-shapefile', (
          <>
            <h2 className="font-medium">Success!</h2>
            <p className="text-sm">Shapefile uploaded</p>
          </>
        ), {
          level: 'success',
        });

        const validGeoJSON = {
          ...g,
          features: g.features.map((fe) => {
            return {
              ...fe,
              properties: fe.properties || {},
            };
          }),
        };

        dispatch(setUploadingValue(validGeoJSON));
        console.info('Shapefile uploaded', g);
      },
      onError: () => {
        setLoading(false);
        addToast('error-upload-shapefile', (
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
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    // accept: 'image/*',
    multiple: false,
    maxSize: 1000000,
    onDropAccepted,
    onDropRejected,
  });

  // Callbacks
  const onSubmit = useCallback((values) => {
    // Save current uploaded shape
    scenarioPUMutation.mutate({
      id: `${sid}`,
      data: {
        byGeoJson: {
          [values.type]: values.uploadingValue,
        },
      },
    }, {
      onSuccess: () => {
        console.info('SUCCESS');
        onSelected(null);
        dispatch(setUploading(false));
        dispatch(setUploadingValue(null));
      },
      onError: () => {
        console.info('ERROR');
      },
    });
  }, [sid, scenarioPUMutation, onSelected, dispatch, setUploading, setUploadingValue]);

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

            {selected && (
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

                  <p className="mt-2 text-gray-300 text-xxs">{'Recommended file size < 1 MB'}</p>

                  <Loading
                    visible={loading}
                    className="absolute top-0 left-0 z-40 flex items-center justify-center w-full h-full bg-gray-600 bg-opacity-90"
                    iconClassName="w-5 h-5 text-primary-500"
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
          </div>
        </form>
      )}
    </FormRFF>
  );
};

export default AnalysisAdjustUploading;
