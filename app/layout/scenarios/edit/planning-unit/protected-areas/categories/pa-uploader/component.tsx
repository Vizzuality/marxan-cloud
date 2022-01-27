import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';

import { PROTECTED_AREA_UPLOADER_MAX_SIZE } from 'constants/file-uploader-size-limits';
import { useDropzone } from 'react-dropzone';
import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import { useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import {
  getScenarioEditSlice,
} from 'store/slices/scenarios/edit';

import cx from 'classnames';
import { motion } from 'framer-motion';
import { bytesToMegabytes } from 'utils/units';

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
import Uploader from 'components/uploader';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

export interface ProtectedAreaUploaderProps {
  input: any;
}

export const ProtectedAreaUploader: React.FC<ProtectedAreaUploaderProps> = ({
  input,
}: ProtectedAreaUploaderProps) => {
  const { query } = useRouter();
  const { sid } = query;
  const formRef = useRef(null);

  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successFile, setSuccessFile] = useState(null);
  const [fileData, saveFileData] = useState(null);
  const { addToast } = useToasts();

  const dispatch = useDispatch();

  const scenarioSlice = getScenarioEditSlice(sid);

  const {
    setCache,
  } = scenarioSlice.actions;

  const uploadPAMutation = useUploadPA({
    requestConfig: {
      method: 'POST',
    },
  });

  useEffect(() => {
    return () => {
      input.onChange(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDropAccepted = async (acceptedFiles) => {
    setLoading(true);
    const f = acceptedFiles[0];

    const data = new FormData();
    data.append('file', f);

    setSuccessFile({ ...successFile, name: f.name });
    saveFileData(data);
    addToast('success-upload-protected-area', (
      <>
        <h2 className="font-medium">Success!</h2>
        <p className="text-sm">Protected area uploaded</p>
      </>
    ), {
      level: 'success',
    });
  };

  const onDropRejected = (rejectedFiles) => {
    const r = rejectedFiles[0];

    // `file-too-large` backend error message is not friendly.
    // It'll display the max size in bytes which the average user may not understand.
    const errors = r.errors.map((error) => {
      return error.code === 'file-too-large'
        ? { error, message: `File is larger than ${bytesToMegabytes(PROTECTED_AREA_UPLOADER_MAX_SIZE)} MB` }
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

  const handleSubmit = useCallback(() => {
    const { name } = formRef.current.getState().values;

    fileData.append('name', name);
    uploadPAMutation.mutate({ id: `${sid}`, data: fileData }, {

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

        addToast('error-upload-protected-area', (
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
  }, [uploadPAMutation, addToast, dispatch, setCache, sid, successFile, fileData]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    multiple: false,
    maxSize: PROTECTED_AREA_UPLOADER_MAX_SIZE,
    onDropAccepted,
    onDropRejected,
  });

  return (
    <Uploader
      caption="Upload your protected area network"
      open={opened}
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
        onSubmit={onDropAccepted}
        render={({ form: uploaderForm }) => {
          formRef.current = uploaderForm;
          const { name } = formRef.current.getState().values;

          return (
            <form onSubmit={handleSubmit}>
              <div className="space-y-5 p-9">
                <h4 className="text-lg text-black font-heading">Upload shapefile</h4>
                <div>
                  <FieldRFF
                    name="name"
                    validate={composeValidators([{ presence: true }])}
                  >
                    {(fprops) => (
                      <Field id="form-name" {...fprops}>
                        <Label theme="light" className="mb-3 uppercase">Name</Label>
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
                          className={cx({
                            'relative py-10 w-full bg-gray-100 bg-opacity-20 border border-dotted border-gray-300 hover:bg-gray-100 cursor-pointer': true,
                            'bg-gray-500': isDragActive,
                            'border-green-800': isDragAccept,
                            'border-red-800': isDragReject || (props?.meta?.error && props?.meta?.touched),
                          })}
                        >

                          <input {...getInputProps()} />

                          <p className="text-sm text-center text-gray-500">
                            Drag and drop your polygon data file
                            <br />
                            or
                            {' '}
                            <b>click here</b>
                            {' '}
                            to upload
                          </p>

                          <p className="mt-2 text-center text-gray-400 text-xxs">{`Recommended file size < ${bytesToMegabytes(PROTECTED_AREA_UPLOADER_MAX_SIZE)} MB`}</p>

                          <Loading
                            visible={loading}
                            className="absolute top-0 left-0 z-40 flex items-center justify-center w-full h-full bg-gray-600 bg-opacity-90"
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
                    <div className="flex flex-col w-full space-y-3 cursor-pointer">
                      <h5 className="text-xs text-black uppercase">Uploaded file:</h5>
                      <div className="flex items-center space-x-2">
                        <label className="px-3 py-1 bg-gray-400 bg-opacity-10 rounded-3xl" htmlFor="cancel-shapefile-btn">
                          <p className="text-sm text-black">{successFile.name}</p>
                        </label>
                        <button
                          id="cancel-shapefile-btn"
                          type="button"
                          className="flex items-center justify-center w-5 h-5 border border-black rounded-full group hover:bg-black"
                          onClick={() => {
                            setSuccessFile(null);
                            saveFileData(null);
                            setLoading(false);
                            input.onChange(null);
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

                <div className="flex justify-center mt-16 space-x-6">
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

                  <Button
                    theme="primary"
                    size="xl"
                    type="submit"
                    disabled={!name}
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
  );
};

export default ProtectedAreaUploader;
