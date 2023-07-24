import React, { useCallback, useState } from 'react';

import { useDropzone, DropzoneProps, FileError } from 'react-dropzone';
import { Form, Field } from 'react-final-form';
import { useDispatch, useSelector } from 'react-redux';

import cx from 'classnames';

import {
  setBbox,
  setUploadingGridId,
  setMaxPuAreaSize,
  setMinPuAreaSize,
} from 'store/slices/projects/new';

import { motion } from 'framer-motion';

import { useUploadProjectPAGrid } from 'hooks/projects';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import { composeValidators } from 'components/forms/validations';
import Icon from 'components/icon';
import InfoButton from 'components/info-button';
import Loading from 'components/loading';
import Uploader from 'components/uploader';
import { PLANNING_AREA_GRID_UPLOADER_MAX_SIZE } from 'constants/file-uploader-size-limits';
import { bytesToMegabytes } from 'utils/units';

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

  const onDropAccepted = async (acceptedFiles: Parameters<DropzoneProps['onDropAccepted']>[0]) => {
    const f = acceptedFiles[0];

    const data = new FormData();
    data.append('file', f);

    setLoading(true);

    uploadProjectPAGridMutation.mutate(
      { data },
      {
        onSuccess: ({ data: { data: g, id: PAid } }) => {
          setLoading(false);
          setSuccessFile({ id: PAid, name: f.name, geom: g });

          addToast(
            'success-upload-shapefile-grid',
            <>
              <h2 className="font-medium">Success!</h2>
              <p className="text-sm">Shapefile grid uploaded</p>
            </>,
            {
              level: 'success',
            }
          );
          console.info('Shapefile grid uploaded', g);
        },
        onError: ({ response }) => {
          const { errors } = response.data;

          setLoading(false);
          setSuccessFile(null);

          addToast(
            'error-upload-shapefile-grid',
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
      }
    );
  };

  const onDropRejected = (rejectedFiles: Parameters<DropzoneProps['onDropRejected']>[0]) => {
    const r = rejectedFiles[0];

    // `file-too-large` backend error message is not friendly.
    // It'll display the max size in bytes which the average user may not understand.
    const errors = r.errors.map((error) => {
      return error.code === 'file-too-large'
        ? {
            error,
            message: `File is larger than ${bytesToMegabytes(
              PLANNING_AREA_GRID_UPLOADER_MAX_SIZE
            )} MB`,
          }
        : error;
    });

    addToast(
      'drop-error',
      <>
        <h2 className="font-medium">Error!</h2>
        <ul className="text-sm">
          {errors.map((e: FileError) => (
            <li key={`${e.code}`}>{e.message}</li>
          ))}
        </ul>
      </>,
      {
        level: 'error',
      }
    );
  };

  const onUploadSubmit = useCallback(() => {
    input.onChange(successFile.id);
    dispatch(setUploadingGridId(successFile.id));
    dispatch(setBbox(successFile.geom.bbox));
    dispatch(setMinPuAreaSize(successFile.geom.marxanMetadata.minPuAreaSize));
    dispatch(setMaxPuAreaSize(successFile.geom.marxanMetadata.maxPuAreaSize));
  }, [dispatch, successFile, input]);

  const onUploadRemove = useCallback(
    (f) => {
      input.onChange(null);
      setSuccessFile(null);
      resetPlanningAreaGrid(f);
    },
    [input, resetPlanningAreaGrid]
  );

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    multiple: false,
    maxSize: PLANNING_AREA_GRID_UPLOADER_MAX_SIZE,
    onDropAccepted,
    onDropRejected,
  });

  return (
    <div className="mb-5 mt-3">
      {!!uploadingGridId && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="flex w-full cursor-pointer flex-col space-y-6">
            <div className="flex items-center space-x-2">
              <label
                className="rounded-3xl bg-blue-100 bg-opacity-10 px-3 py-1"
                htmlFor="cancel-shapefile-btn"
              >
                <p className="text-sm text-primary-500">{successFile.name}</p>
              </label>
              <button
                aria-label="remove"
                id="cancel-shapefile-grid-btn"
                type="button"
                className="group flex h-5 w-5 items-center justify-center rounded-full border border-white hover:bg-black"
                onClick={() => onUploadRemove(form)}
              >
                <Icon className="h-1.5 w-1.5 text-white group-hover:text-white" icon={CLOSE_SVG} />
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
                    <h4 className="mb-5 font-heading text-lg text-black">Upload shapefile grid</h4>

                    {!successFile && (
                      <Field name="dropFile" validate={composeValidators([{ presence: true }])}>
                        {(props) => (
                          <div>
                            <div className="mb-2.5 flex items-center space-x-3">
                              <h5 className="text-xs text-gray-400">Supported formats</h5>
                              <InfoButton size="s" theme="secondary">
                                <span className="text-xs">
                                  {' '}
                                  <h4 className="mb-2.5 font-heading">
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
                                'relative w-full cursor-pointer border border-dotted border-gray-300 bg-gray-100 bg-opacity-20 py-10 hover:bg-gray-100':
                                  true,
                                'bg-gray-500': isDragActive,
                                'border-green-800': isDragAccept,
                                'border-red-800':
                                  isDragReject || (props?.meta?.error && props?.meta?.touched),
                              })}
                            >
                              <input {...getInputProps()} />

                              <p className="text-center text-sm text-gray-500">
                                Drag and drop your planning unit shapefile
                                <br />
                                or <b>click here</b> to upload
                              </p>

                              <Loading
                                visible={loading}
                                className="absolute left-0 top-0 z-40 flex h-full w-full items-center justify-center bg-white bg-opacity-90"
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
                        <div className="flex w-full cursor-pointer flex-col space-y-3">
                          <h5 className="text-xs uppercase text-black">Uploaded file:</h5>
                          <div className="flex items-center space-x-2">
                            <label
                              className="rounded-3xl bg-gray-400 bg-opacity-10 px-3 py-1"
                              htmlFor="cancel-shapefile-btn"
                            >
                              <p className="text-sm text-black">{successFile.name}</p>
                            </label>
                            <button
                              id="cancel-shapefile-btn"
                              type="button"
                              className="group flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-black hover:bg-black"
                              onClick={() => {
                                setSuccessFile(null);
                              }}
                            >
                              <Icon
                                className="h-1.5 w-1.5 text-black group-hover:text-white"
                                icon={CLOSE_SVG}
                              />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <ul className="ml-3 mt-3 flex list-disc flex-col items-start text-center text-xxs leading-5 text-gray-400">
                      <li>
                        {`Recommended file size < ${bytesToMegabytes(
                          PLANNING_AREA_GRID_UPLOADER_MAX_SIZE
                        )} MB`}
                      </li>
                      <li>Include only the geometry.</li>
                      <li>The grid included should work as a continuous surface.</li>
                    </ul>

                    <div className="mt-16 flex justify-center space-x-6">
                      <Button theme="secondary" size="xl" onClick={() => setOpened(false)}>
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
