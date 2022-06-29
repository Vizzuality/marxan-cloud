import React, { useCallback, useRef, useState } from 'react';

import { PROJECT_UPLOADER_MAX_SIZE } from 'constants/file-uploader-size-limits';
import { useDropzone } from 'react-dropzone';
import { Form, Field as FieldRFF } from 'react-final-form';
import { useDispatch } from 'react-redux';

import { setUploadMode } from 'store/slices/projects/new';

import cx from 'classnames';
import { motion } from 'framer-motion';
import { bytesToMegabytes } from 'utils/units';

import { useImportProject } from 'hooks/projects';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import Field from 'components/forms/field';
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import { composeValidators } from 'components/forms/validations';
import Icon from 'components/icon';
import InfoButton from 'components/info-button';
import Loading from 'components/loading';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

export interface UploadModalProps {
  onDismiss: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  onDismiss,
}: UploadModalProps) => {
  const formRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [successFile, setSuccessFile] = useState(null);

  const dispatch = useDispatch();

  const { addToast } = useToasts();

  const importMutation = useImportProject({});

  const onDropAccepted = async (acceptedFiles) => {
    const f = acceptedFiles[0];

    setSuccessFile(f);
    formRef.current.change('file', f);
  };

  const onDropRejected = (rejectedFiles) => {
    const r = rejectedFiles[0];

    // `file-too-large` backend error message is not friendly.
    // It'll display the max size in bytes which the average user may not understand.
    const errors = r.errors.map((error) => {
      return error.code === 'file-too-large'
        ? { error, message: `File is larger than ${bytesToMegabytes(PROJECT_UPLOADER_MAX_SIZE)} MB` }
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

  const onUploadSubmit = useCallback((values) => {
    setLoading(true);
    const { file, name } = values;

    const data = new FormData();
    data.append('projectName', name);
    data.append('file', file);

    importMutation.mutate({ data }, {
      onSuccess: () => {
        setLoading(false);
        addToast('success-upload-project', (
          <>
            <h2 className="font-medium">Success!</h2>
            <p className="text-sm">Project uploaded</p>
          </>
        ), {
          level: 'success',
        });
        onDismiss();

        console.info('Project uploaded');
      },
      onError: ({ response }) => {
        const { errors } = response.data;

        setLoading(false);

        addToast('error-upload-project', (
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
  }, [
    addToast,
    importMutation,
    onDismiss,
  ]);

  const onUploadRemove = useCallback(() => {
    setSuccessFile(null);
  }, []);

  const onSetLegacyUpload = useCallback(() => {
    dispatch(setUploadMode('legacy'));
  }, [dispatch]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    multiple: false,
    maxSize: PROJECT_UPLOADER_MAX_SIZE,
    onDropAccepted,
    onDropRejected,
  });

  return (
    <div className="mt-3 mb-5">
      <Form
        onSubmit={onUploadSubmit}
        render={({ form, handleSubmit }) => {
          formRef.current = form;

          return (
            <form onSubmit={handleSubmit}>
              <div className="p-9">
                <h4 className="mb-5 text-lg text-black font-heading">Upload project</h4>

                <div className="space-y-5">
                  <FieldRFF
                    name="name"
                    validate={composeValidators([{ presence: true }])}
                  >
                    {(fprops) => (
                      <Field id="name" {...fprops}>
                        <div className="flex items-center mb-3 space-x-2">
                          <Label theme="light" className="uppercase" id="name">
                            Name
                          </Label>
                        </div>
                        <Input theme="light" type="text" placeholder="Write project name..." />
                      </Field>
                    )}
                  </FieldRFF>

                  {!successFile && (
                    <FieldRFF name="file" validate={composeValidators([{ presence: true }])}>
                      {(props) => (
                        <div>
                          <Label theme="light" className="uppercase" id="file">
                            Project zip
                          </Label>

                          <div className="flex items-center my-2.5 space-x-3">
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
                                  Zipped: .zip
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
                              Drag and drop your project .zip
                              <br />
                              or
                              {' '}
                              <b>click here</b>
                              {' '}
                              to upload
                            </p>

                            <p className="mt-2 text-center text-gray-400 text-xxs">{`Recommended file size < ${bytesToMegabytes(PROJECT_UPLOADER_MAX_SIZE)} MB`}</p>
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
                            <p className="text-sm text-black">{successFile.path}</p>
                          </label>
                          <button
                            id="cancel-shapefile-btn"
                            type="button"
                            className="flex items-center justify-center flex-shrink-0 w-5 h-5 border border-black rounded-full group hover:bg-black"
                            onClick={() => {
                              setSuccessFile(null);
                              onUploadRemove();
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
                </div>
                <p className="mt-4 text-sm text-gray-400 lg:text-base">
                  If you have a legacy project and prefer to upload the files, please
                  {' '}
                  <button
                    type="button"
                    className="font-semibold underline cursor-pointer hover:no-underline"
                    onClick={onSetLegacyUpload}
                  >
                    click here
                  </button>
                </p>
                <div className="flex justify-center mt-16 space-x-6">
                  <Button
                    theme="secondary"
                    size="xl"
                    onClick={() => onDismiss()}
                  >
                    Cancel
                  </Button>

                  <Button
                    theme="primary"
                    size="xl"
                    type="submit"
                  >
                    Save
                  </Button>
                </div>
              </div>

              <Loading
                visible={loading}
                className="absolute top-0 left-0 z-40 flex items-center justify-center w-full h-full bg-white bg-opacity-90"
                iconClassName="w-10 h-10 text-primary-500"
              />
            </form>
          );
        }}
      />
    </div>
  );
};

export default UploadModal;
