import React, { useCallback, useRef, useState } from 'react';

import { useDropzone, DropzoneProps } from 'react-dropzone';
import { Form, Field as FieldRFF } from 'react-final-form';

import cx from 'classnames';

import { motion } from 'framer-motion';

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
import { PROJECT_UPLOADER_MAX_SIZE } from 'constants/file-uploader-size-limits';
import { bytesToMegabytes } from 'utils/units';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

export interface UploadModalProps {
  onDismiss: (notCancel?: boolean) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ onDismiss }: UploadModalProps) => {
  const formRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [successFile, setSuccessFile] = useState(null);

  const { addToast } = useToasts();

  const importMutation = useImportProject({});

  const onDropAccepted = async (acceptedFiles: Parameters<DropzoneProps['onDropAccepted']>[0]) => {
    const f = acceptedFiles[0];

    setSuccessFile(f);
    formRef.current.change('file', f);
  };

  const onDropRejected = (rejectedFiles: Parameters<DropzoneProps['onDropRejected']>[0]) => {
    const r = rejectedFiles[0];

    // `file-too-large` backend error message is not friendly.
    // It'll display the max size in bytes which the average user may not understand.
    const errors = r.errors.map((error) => {
      return error.code === 'file-too-large'
        ? {
            ...error,
            message: `File is larger than ${bytesToMegabytes(PROJECT_UPLOADER_MAX_SIZE)} MB`,
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

  const onUploadSubmit = useCallback(
    (values) => {
      setLoading(true);
      const { file, name } = values;

      const data = new FormData();
      data.append('projectName', name);
      data.append('file', file);

      importMutation.mutate(
        { data },
        {
          onSuccess: () => {
            setLoading(false);
            addToast(
              'success-upload-project',
              <>
                <h2 className="font-medium">Success!</h2>
                <p className="text-sm">Project uploaded</p>
              </>,
              {
                level: 'success',
              }
            );
            onDismiss();

            console.info('Project uploaded');
          },
          onError: ({ response }) => {
            const { errors } = response.data;

            setLoading(false);

            addToast(
              'error-upload-project',
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
    },
    [addToast, importMutation, onDismiss]
  );

  const onUploadRemove = useCallback(() => {
    setSuccessFile(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    multiple: false,
    maxSize: PROJECT_UPLOADER_MAX_SIZE,
    onDropAccepted,
    onDropRejected,
  });

  return (
    <div className="mb-5 mt-3">
      <Form
        onSubmit={onUploadSubmit}
        render={({ form, handleSubmit }) => {
          formRef.current = form;

          return (
            <form onSubmit={handleSubmit}>
              <div className="p-9">
                <h4 className="mb-5 font-heading text-lg text-black">Upload project</h4>

                <div className="space-y-5">
                  <FieldRFF name="name" validate={composeValidators([{ presence: true }])}>
                    {(fprops) => (
                      <Field id="name" {...fprops}>
                        <div className="mb-3 flex items-center space-x-2">
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

                          <div className="my-2.5 flex items-center space-x-3">
                            <h5 className="text-xs text-gray-600">Supported formats</h5>
                            <InfoButton size="s" theme="secondary">
                              <span className="text-xs">
                                {' '}
                                <h4 className="mb-2.5 font-heading">
                                  List of supported file formats:
                                </h4>
                                <ul>Zipped: .zip</ul>
                              </span>
                            </InfoButton>
                          </div>

                          <div
                            {...props}
                            {...getRootProps()}
                            className={cx({
                              'relative w-full cursor-pointer border border-dotted border-gray-400 bg-gray-200 bg-opacity-20 py-10 hover:bg-gray-200':
                                true,
                              'bg-gray-600': isDragActive,
                              'border-green-800': isDragAccept,
                              'border-red-800':
                                isDragReject || (props?.meta?.error && props?.meta?.touched),
                            })}
                          >
                            <input {...getInputProps()} />

                            <p className="text-center text-sm text-gray-600">
                              Drag and drop your project .zip
                              <br />
                              or <b>click here</b> to upload
                            </p>

                            <p className="mt-2 text-center text-xxs text-gray-100">{`Recommended file size < ${bytesToMegabytes(
                              PROJECT_UPLOADER_MAX_SIZE
                            )} MB`}</p>
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
                            <p className="text-sm text-black">{successFile.path}</p>
                          </label>
                          <button
                            id="cancel-shapefile-btn"
                            type="button"
                            className="group flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-black hover:bg-black"
                            onClick={() => {
                              setSuccessFile(null);
                              onUploadRemove();
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
                </div>
                <div className="mt-16 flex justify-center space-x-6">
                  <Button theme="secondary" size="xl" onClick={() => onDismiss()}>
                    Cancel
                  </Button>

                  <Button theme="primary" size="xl" type="submit">
                    Save
                  </Button>
                </div>
              </div>

              <Loading
                visible={loading}
                className="absolute left-0 top-0 z-40 flex h-full w-full items-center justify-center bg-white bg-opacity-90"
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
