import React, { useCallback, useRef, useState } from 'react';

import { useDropzone, DropzoneProps } from 'react-dropzone';
import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import { useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { motion } from 'framer-motion';

import { useUploadPA } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import Field from 'components/forms/field';
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import { composeValidators } from 'components/forms/validations';
import Icon from 'components/icon';
import InfoButton from 'components/info-button';
import Loading from 'components/loading';
import Modal from 'components/modal';
import { PROTECTED_AREA_UPLOADER_MAX_SIZE } from 'constants/file-uploader-size-limits';
import { cn } from 'utils/cn';
import { bytesToMegabytes } from 'utils/units';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';
import UPLOAD_SVG from 'svgs/ui/new-layout/uploader.svg?sprite';

export const UploadProtectedAreasButton = () => {
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

  // const editable = useCanEditScenario(pid, sid);

  const uploadPAMutation = useUploadPA({
    requestConfig: {
      method: 'POST',
    },
  });

  const onDropAccepted = async (acceptedFiles: Parameters<DropzoneProps['onDropAccepted']>[0]) => {
    setLoading(true);
    const f = acceptedFiles[0];

    const data = new FormData();
    data.append('file', f);

    setSuccessFile({ ...successFile, name: f.name });
    saveFileData(data);
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
  };

  const onDropRejected = (rejectedFiles: Parameters<DropzoneProps['onDropRejected']>[0]) => {
    const r = rejectedFiles[0];

    // `file-too-large` backend error message is not friendly.
    // It'll display the max size in bytes which the average user may not understand.
    const errors = r.errors.map((error) => {
      return error.code === 'file-too-large'
        ? {
            ...error,
            message: `File is larger than ${bytesToMegabytes(PROTECTED_AREA_UPLOADER_MAX_SIZE)} MB`,
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
        onSuccess: () => {
          setLoading(false);
          setSuccessFile({ ...successFile });

          dispatch(setCache(Date.now()));
          setOpened(false);
        },
        onError: ({ response }) => {
          const { errors } = response.data;

          setLoading(false);
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
      }
    );
  }, [uploadPAMutation, addToast, dispatch, setCache, sid, successFile, fileData]);

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    multiple: false,
    maxSize: PROTECTED_AREA_UPLOADER_MAX_SIZE,
    onDropAccepted,
    onDropRejected,
  });

  return (
    <div className="mb-5 mt-3">
      <Button
        className="dropzone space-x-2"
        theme="primary"
        size="base"
        // !TODO: Review editable and permissions logic
        // disabled={!editable}
        onClick={() => {
          setOpened(true);
          setSuccessFile(null);
          saveFileData(null);
          setLoading(false);
        }}
      >
        <p>Upload</p>
        <Icon className="h-6 w-6 text-gray-800" icon={UPLOAD_SVG} />
      </Button>

      <Modal
        id="upload protected-features"
        open={opened}
        size="narrow"
        onDismiss={() => setOpened(false)}
      >
        <FormRFF
          ref={formRef}
          onSubmit={onSubmit}
          render={({ form: uploaderForm, handleSubmit }) => {
            formRef.current = uploaderForm;
            const { name } = formRef.current.getState().values;

            return (
              <form onSubmit={handleSubmit}>
                <div className="space-y-5 px-9">
                  <h4 className="font-heading text-lg text-black">Upload protected area</h4>

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
                              Drag and drop your polygon data file
                              <br />
                              or <b>click here</b> to upload
                            </p>

                            <p className="mt-2 text-center text-xxs text-gray-400">{`Recommended file size < ${bytesToMegabytes(
                              PROTECTED_AREA_UPLOADER_MAX_SIZE
                            )} MB`}</p>

                            <Loading
                              visible={loading}
                              className="absolute left-0 top-0 z-40 flex h-full w-full items-center justify-center bg-gray-600 bg-opacity-90"
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
                            className="rounded-3xl bg-gray-400 bg-opacity-10 px-3 py-1"
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
                    <h5 className="text-xs text-gray-400">Supported formats</h5>
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
      </Modal>
    </div>
  );
};

export default UploadProtectedAreasButton;
