import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useDropzone, DropzoneProps } from 'react-dropzone';
import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import { useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { motion } from 'framer-motion';

import { useCanEditScenario } from 'hooks/permissions';
import { useToasts } from 'hooks/toast';
import { useUploadWDPAsShapefile } from 'hooks/wdpa';

import Button from 'components/button';
import Field from 'components/forms/field';
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import { composeValidators } from 'components/forms/validations';
import Icon from 'components/icon';
import InfoButton from 'components/info-button';
import Loading from 'components/loading';
import Uploader from 'components/uploader';
import { PROTECTED_AREA_UPLOADER_SHAPEFILE_MAX_SIZE } from 'constants/file-uploader-size-limits';
import { cn } from 'utils/cn';
import { bytesToMegabytes } from 'utils/units';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

export const ProtectedAreaUploader = ({ input }): JSX.Element => {
  const queryClient = useQueryClient();
  const { query } = useRouter();
  const { pid, sid } = query as { pid: string; sid: string };
  const formRef = useRef(null);

  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successFile, setSuccessFile] = useState(null);
  const [fileData, saveFileData] = useState(null);
  const { addToast } = useToasts();

  const dispatch = useDispatch();

  const scenarioSlice = getScenarioEditSlice(sid);

  const { setCache } = scenarioSlice.actions;

  const editable = useCanEditScenario(pid, sid);

  const uploadPAMutation = useUploadWDPAsShapefile();

  useEffect(() => {
    return () => {
      input.onChange(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDropAccepted = (acceptedFiles: Parameters<DropzoneProps['onDropAccepted']>[0]) => {
    setLoading(true);
    const f = acceptedFiles[0];

    const data = new FormData();
    data.append('file', f);

    setSuccessFile({ ...successFile, name: f.name });
    saveFileData(data);
  };

  const onDropRejected = (rejectedFiles: Parameters<DropzoneProps['onDropRejected']>[0]) => {
    const r = rejectedFiles[0];

    // `file-too-large` backend error message is not friendly.
    // It'll display the max size in bytes which the average user may not understand.
    const errors = r.errors.map((error) => {
      return error.code === 'file-too-large'
        ? {
            ...error,
            message: `File is larger than ${bytesToMegabytes(
              PROTECTED_AREA_UPLOADER_SHAPEFILE_MAX_SIZE
            )} MB`,
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

  const onSubmit = useCallback(() => {
    const { name } = formRef.current.getState().values;

    fileData.append('name', name);
    uploadPAMutation.mutate(
      { id: `${sid}`, data: fileData },
      {
        onSuccess: async () => {
          setSuccessFile({ ...successFile });

          await queryClient.invalidateQueries(['protected-areas']);

          addToast(
            'success-upload-protected-area',
            <>
              <h2 className="font-medium">Success!</h2>
              <p className="text-sm">Protected area uploaded</p>
            </>,
            {
              level: 'success',
            }
          );

          dispatch(setCache(Date.now()));
          setOpened(false);
        },
        onError: ({ response }) => {
          const { errors } = response.data;

          setSuccessFile(null);

          addToast(
            'error-upload-protected-area',
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
  }, [uploadPAMutation, addToast, dispatch, setCache, sid, successFile, fileData]);

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    multiple: false,
    maxSize: PROTECTED_AREA_UPLOADER_SHAPEFILE_MAX_SIZE,
    onDropAccepted,
    onDropRejected,
  });

  return (
    <Uploader
      caption="Upload your protected area network"
      open={opened}
      disabled={!editable}
      onOpen={() => {
        setOpened(true);
        setSuccessFile(null);
        saveFileData(null);
        setLoading(false);
      }}
      onClose={() => setOpened(false)}
    >
      <FormRFF
        ref={formRef}
        onSubmit={onSubmit}
        render={({ form: uploaderForm, handleSubmit }) => {
          formRef.current = uploaderForm;
          const { name } = formRef.current.getState().values;

          return (
            <form onSubmit={handleSubmit}>
              <div className="space-y-5 p-9">
                <div className="mb-5 flex items-center space-x-3">
                  <h4 className="font-heading text-lg text-black">Upload shapefile</h4>
                  <InfoButton size="base" theme="primary">
                    <span className="text-xs">
                      {' '}
                      <h4 className="mb-2.5 font-heading">
                        When uploading shapefiles of protected areas, please make sure that:
                      </h4>
                      <ul className="list-disc space-y-1 pl-6">
                        <li>
                          this is a single zip file that includes all the components of a single
                          shapefile;
                        </li>
                        <li>
                          all the components are added to the “root”/top-level of the zip file
                          itself (that is, not within any folder within the zip file);
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
                <div>
                  <FieldRFF name="name" validate={composeValidators([{ presence: true }])}>
                    {(fprops) => (
                      <Field id="form-name" {...fprops}>
                        <Label theme="light" className="mb-3 uppercase">
                          Name
                        </Label>
                        <Input theme="light" />
                      </Field>
                    )}
                  </FieldRFF>
                </div>

                {!successFile && (
                  <FieldRFF name="file" validate={composeValidators([{ presence: true }])}>
                    {(props) => (
                      <div>
                        <div
                          {...props}
                          {...getRootProps()}
                          className={cn({
                            'relative w-full cursor-pointer border border-dotted border-gray-400 bg-gray-200 bg-opacity-20 py-10 hover:bg-gray-200':
                              true,
                            'bg-gray-600': isDragActive,
                            'border-green-900': isDragAccept,
                            'border-red-900':
                              isDragReject || (props?.meta?.error && props?.meta?.touched),
                          })}
                        >
                          <input {...getInputProps()} />

                          <p className="text-center text-sm text-gray-600">
                            Drag and drop your polygon data file
                            <br />
                            or <b>click here</b> to upload
                          </p>

                          <p className="mt-2 text-center text-xxs text-gray-400">{`Recommended file size < ${bytesToMegabytes(
                            PROTECTED_AREA_UPLOADER_SHAPEFILE_MAX_SIZE
                          )} MB`}</p>

                          <Loading
                            visible={loading}
                            className="absolute left-0 top-0 z-40 flex h-full w-full items-center justify-center bg-gray-700 bg-opacity-90"
                            iconClassName="w-5 h-5 text-primary-500"
                          />
                        </div>
                      </div>
                    )}
                  </FieldRFF>
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
                          className="rounded-3xl bg-gray-100 bg-opacity-10 px-3 py-1"
                          htmlFor="cancel-shapefile-btn"
                        >
                          <p className="text-sm text-black">{successFile.name}</p>
                        </label>
                        <button
                          id="cancel-shapefile-btn"
                          type="button"
                          className="group flex h-5 w-5 items-center justify-center rounded-full border border-black hover:bg-black"
                          onClick={() => {
                            setSuccessFile(null);
                            saveFileData(null);
                            setLoading(false);
                            input.onChange(null);
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

                <div className="mb-2.5 flex items-center space-x-3">
                  <h5 className="text-xs text-gray-600">Supported formats</h5>
                  <InfoButton size="s" theme="secondary">
                    <span className="text-xs">
                      {' '}
                      <h4 className="mb-2.5 font-heading">List of supported file formats:</h4>
                      <ul>
                        Zipped: .shp (zipped shapefiles must include
                        <br />
                        .shp, .shx, .dbf, and .prj files)
                      </ul>
                    </span>
                  </InfoButton>
                </div>

                <div className="mt-16 flex justify-center space-x-6">
                  <Button
                    theme="secondary"
                    size="xl"
                    onClick={() => {
                      setOpened(false);
                      saveFileData(null);
                    }}
                  >
                    Cancel
                  </Button>

                  <Button theme="primary" size="xl" type="submit" disabled={!name}>
                    Save
                  </Button>
                </div>
              </div>
            </form>
          );
        }}
      />
    </Uploader>
  );
};

export default ProtectedAreaUploader;
