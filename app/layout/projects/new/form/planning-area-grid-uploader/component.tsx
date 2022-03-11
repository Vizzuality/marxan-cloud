import React, { useCallback, useState } from 'react';

import { PLANNING_AREA_GRID_UPLOADER_MAX_SIZE } from 'constants/file-uploader-size-limits';
import { useDropzone } from 'react-dropzone';
import { Form, Field } from 'react-final-form';
import { useDispatch, useSelector } from 'react-redux';

import {
  setBbox, setUploadingGridId, setMaxPuAreaSize, setMinPuAreaSize,
} from 'store/slices/projects/new';

import cx from 'classnames';
import { motion } from 'framer-motion';
import { bytesToMegabytes } from 'utils/units';

import { useUploadProjectPAGrid } from 'hooks/projects';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import { composeValidators } from 'components/forms/validations';
import Icon from 'components/icon';
import InfoButton from 'components/info-button';
import Loading from 'components/loading';
import Uploader from 'components/uploader';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

export interface PlanningAreaGridUploaderProps {
  input: any;
  form: any;
  resetPlanningAreaGrid: (form) => void;
}

export const PlanningAreaGridUploader: React.FC<PlanningAreaGridUploaderProps> = ({
  input,
  form,
  resetPlanningAreaGrid,
}: PlanningAreaGridUploaderProps) => {
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successFile, setSuccessFile] = useState(null);

  const { addToast } = useToasts();

  const dispatch = useDispatch();

  const uploadProjectPAGridMutation = useUploadProjectPAGrid({
    requestConfig: {
      method: 'POST',
    },
  });

  const { uploadingGridId } = useSelector((state) => state['/projects/new']);

  const onDropAccepted = async (acceptedFiles) => {
    const f = acceptedFiles[0];

    const data = new FormData();
    data.append('file', f);

    setLoading(true);

    uploadProjectPAGridMutation.mutate({ data }, {
      onSuccess: ({ data: { data: g, id: PAid } }) => {
        setLoading(false);
        setSuccessFile({ id: PAid, name: f.name, geom: g });

        addToast('success-upload-shapefile-grid', (
          <>
            <h2 className="font-medium">Success!</h2>
            <p className="text-sm">Shapefile grid uploaded</p>
          </>
        ), {
          level: 'success',
        });
        console.info('Shapefile grid uploaded', g);
      },
      onError: ({ response }) => {
        const { errors } = response.data;

        setLoading(false);
        setSuccessFile(null);

        addToast('error-upload-shapefile-grid', (
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
        ? { error, message: `File is larger than ${bytesToMegabytes(PLANNING_AREA_GRID_UPLOADER_MAX_SIZE)} MB` }
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

  const onUploadSubmit = useCallback(() => {
    input.onChange(successFile.id);
    dispatch(setUploadingGridId(successFile.id));
    dispatch(setBbox(successFile.geom.bbox));
    dispatch(setMinPuAreaSize(successFile.geom.marxanMetadata.minPuAreaSize));
    dispatch(setMaxPuAreaSize(successFile.geom.marxanMetadata.maxPuAreaSize));
  }, [dispatch, successFile, input]);

  const onUploadRemove = useCallback((f) => {
    input.onChange(null);
    setSuccessFile(null);
    resetPlanningAreaGrid(f);
  }, [input, resetPlanningAreaGrid]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    multiple: false,
    maxSize: PLANNING_AREA_GRID_UPLOADER_MAX_SIZE,
    onDropAccepted,
    onDropRejected,
  });

  return (
    <div className="mt-3 mb-5">
      {!!uploadingGridId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex flex-col w-full space-y-6 cursor-pointer">
            <div className="flex items-center space-x-2">
              <label className="px-3 py-1 bg-blue-100 bg-opacity-10 rounded-3xl" htmlFor="cancel-shapefile-btn">
                <p className="text-sm text-primary-500">{successFile.name}</p>
              </label>
              <button
                aria-label="remove"
                id="cancel-shapefile-grid-btn"
                type="button"
                className="flex items-center justify-center w-5 h-5 border border-white rounded-full group hover:bg-black"
                onClick={() => onUploadRemove(form)}
              >
                <Icon
                  className="w-1.5 h-1.5 text-white group-hover:text-white"
                  icon={CLOSE_SVG}
                />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {!uploadingGridId && (
        <Uploader
          caption="Upload shapefile"
          open={opened}
          onOpen={() => setOpened(true)}
          onClose={() => setOpened(false)}
        >
          <Form
            onSubmit={onUploadSubmit}
            render={({ handleSubmit }) => {
              return (
                <form onSubmit={handleSubmit}>
                  <div className="p-9">
                    <h4 className="mb-5 text-lg text-black font-heading">Upload shapefile grid</h4>

                    {!successFile && (
                      <Field name="dropFile" validate={composeValidators([{ presence: true }])}>
                        {(props) => (
                          <div>
                            <div className="flex items-center mb-2.5 space-x-3">
                              <h5 className="text-xs text-gray-400">Supported formats</h5>
                              <InfoButton
                                size="s"
                                theme="secondary"
                              >
                                <span className="text-xs">
                                  {' '}
                                  <h4 className="font-heading mb-2.5">
                                    List of supported file formats:
                                  </h4>
                                  <ul>
                                    Zipped: .shp (zipped shapefiles must include
                                    <br />
                                    .shp, .shx, .dbf, and .prj files)
                                  </ul>
                                </span>
                              </InfoButton>
                            </div>

                            <div
                              {...props}
                              {...getRootProps()}
                              className={cx({
                                'relative py-10 w-full bg-gray-100 bg-opacity-20 border border-dotted border-gray-300 hover:bg-gray-100 cursor-pointer': true,
                                'bg-gray-500': isDragActive,
                                'border-green-800': isDragAccept,
                                'border-red-800': isDragReject || (props?.meta?.error && props?.meta?.touched),
                              })}
                            >

                              <input {...getInputProps()} />

                              <p className="text-sm text-center text-gray-500">
                                Drag and drop your planning unit shapefile
                                <br />
                                or
                                {' '}
                                <b>click here</b>
                                {' '}
                                to upload
                              </p>

                              <Loading
                                visible={loading}
                                className="absolute top-0 left-0 z-40 flex items-center justify-center w-full h-full bg-white bg-opacity-90"
                                iconClassName="w-5 h-5 text-primary-500"
                              />

                            </div>
                          </div>
                        )}
                      </Field>
                    )}

                    {successFile && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <div className="flex flex-col w-full space-y-3 cursor-pointer">
                          <h5 className="text-xs text-black uppercase">Uploaded file:</h5>
                          <div className="flex items-center space-x-2">
                            <label className="px-3 py-1 bg-gray-400 bg-opacity-10 rounded-3xl" htmlFor="cancel-shapefile-btn">
                              <p className="text-sm text-black">{successFile.name}</p>
                            </label>
                            <button
                              id="cancel-shapefile-btn"
                              type="button"
                              className="flex items-center justify-center flex-shrink-0 w-5 h-5 border border-black rounded-full group hover:bg-black"
                              onClick={() => {
                                setSuccessFile(null);
                              }}
                            >
                              <Icon
                                className="w-1.5 h-1.5 text-black group-hover:text-white"
                                icon={CLOSE_SVG}
                              />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <ul className="flex flex-col items-start mt-3 ml-3 leading-5 text-center text-gray-400 list-disc text-xxs">
                      <li>
                        {`Recommended file size < ${bytesToMegabytes(PLANNING_AREA_GRID_UPLOADER_MAX_SIZE)} MB`}
                      </li>
                      <li>
                        Include only the geometry.
                      </li>
                      <li>
                        The grid included should work as a continuous surface.
                      </li>
                    </ul>

                    <div className="flex justify-center mt-16 space-x-6">
                      <Button
                        theme="secondary"
                        size="xl"
                        onClick={() => setOpened(false)}
                      >
                        Cancel
                      </Button>

                      <Button
                        theme="primary"
                        size="xl"
                        type="submit"
                        onClick={() => setOpened(false)}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </form>
              );
            }}
          />
        </Uploader>
      )}
    </div>
  );
};

export default PlanningAreaGridUploader;
