import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useDropzone, DropzoneProps } from 'react-dropzone';
import { Form as FormRFF, Field as FieldRFF, FormProps } from 'react-final-form';

import { useRouter } from 'next/router';

import { AxiosError, isAxiosError } from 'axios';
import { motion } from 'framer-motion';

import { useDownloadFeatureTemplate, useUploadFeaturesShapefile } from 'hooks/features';
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
import { FEATURES_UPLOADER_MAX_SIZE } from 'constants/file-uploader-size-limits';
import UploadFeaturesInfoButtonContent from 'constants/info-button-content/upload-features';
import { cn } from 'utils/cn';
import { bytesToMegabytes } from 'utils/units';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

import UploadFeatureTabs from './upload-tabs';

export type FormValues = {
  name: string;
  file: File;
};

export const FeatureUploadModal = ({
  isOpen = false,
  onDismiss,
}: {
  isOpen?: boolean;
  onDismiss: () => void;
}): JSX.Element => {
  const formRef = useRef<FormProps<FormValues>['form']>(null);

  const [loading, setLoading] = useState(false);
  const [successFile, setSuccessFile] = useState<{ name: FormValues['name'] }>(null);
  const [uploadMode, saveUploadMode] = useState<'shapefile' | 'csv'>('shapefile');

  const { query } = useRouter();
  const { pid } = query as { pid: string };

  const { addToast } = useToasts();

  const uploadFeaturesShapefileMutation = useUploadFeaturesShapefile({
    requestConfig: {
      method: 'POST',
    },
  });

  const downloadFeatureTemplateMutation = useDownloadFeatureTemplate();

  useEffect(() => {
    return () => {
      setSuccessFile(null);
    };
  }, []);

  const onClose = useCallback(() => {
    onDismiss();
    setSuccessFile(null);
  }, [onDismiss]);

  const onDropAccepted = (acceptedFiles: Parameters<DropzoneProps['onDropAccepted']>[0]) => {
    const f = acceptedFiles[0];
    setSuccessFile({ name: f.name });

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
            message: `File is larger than ${bytesToMegabytes(FEATURES_UPLOADER_MAX_SIZE)} MB`,
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
    (values: FormValues) => {
      setLoading(true);
      const { file, name } = values;

      const data = new FormData();
      data.append('file', file);
      data.append('name', name);

      uploadFeaturesShapefileMutation.mutate(
        { data, id: `${pid}` },
        {
          onSuccess: () => {
            setSuccessFile({ ...successFile });
            onClose();
            addToast(
              'success-upload-feature-shapefile',
              <>
                <h2 className="font-medium">Success!</h2>
                <p className="text-sm">Shapefile uploaded</p>
              </>,
              {
                level: 'success',
              }
            );

            console.info('Feature shapefile uploaded');
          },
          onError: (error: AxiosError | Error) => {
            let errors: { status: number; title: string }[] = [];

            if (isAxiosError(error)) {
              errors = [...error.response.data.errors];
            } else {
              // ? in case of unknown error (not request error), display generic error message
              errors = [{ status: 500, title: 'Something went wrong' }];
            }

            setSuccessFile(null);

            addToast(
              'error-upload-feature-shapefile',
              <>
                <h2 className="font-medium">Error</h2>
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
    },
    [pid, addToast, onClose, uploadFeaturesShapefileMutation, successFile]
  );

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    multiple: false,
    maxSize: FEATURES_UPLOADER_MAX_SIZE,
    onDropAccepted,
    onDropRejected,
  });

  const onDownloadTemplate = useCallback(() => {
    downloadFeatureTemplateMutation.mutate(
      { pid },
      {
        onSuccess: () => {},
        onError: () => {
          addToast(
            'download-error',
            <>
              <h2 className="font-medium">Error!</h2>
              <ul className="text-sm">Template not downloaded</ul>
            </>,
            {
              level: 'error',
            }
          );
        },
      }
    );
  }, [pid, downloadFeatureTemplateMutation, addToast]);

  return (
    <Modal id="features-upload" open={isOpen} size="narrow" onDismiss={onDismiss}>
      <FormRFF<FormValues>
        ref={formRef}
        onSubmit={onUploadSubmit}
        render={({ form, handleSubmit }) => {
          formRef.current = form;

          return (
            <form onSubmit={handleSubmit}>
              <div className="space-y-5 p-9">
                <div className="mb-5 flex items-center space-x-3">
                  <h4 className="font-heading text-lg text-black">Upload feature</h4>
                  <InfoButton size="base" theme="primary">
                    <UploadFeaturesInfoButtonContent />
                  </InfoButton>
                </div>

                <UploadFeatureTabs mode={uploadMode} onChange={(mode) => saveUploadMode(mode)} />
                {uploadMode === 'csv' && (
                  <p className="!mt-4 text-sm text-gray-400">
                    Please download and fill in the{' '}
                    <button
                      className="text-primary-500 underline hover:no-underline"
                      onClick={onDownloadTemplate}
                    >
                      CSV template
                    </button>{' '}
                    before upload.
                  </p>
                )}

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
                  <div>
                    <Label theme="light" className="mb-3 uppercase">
                      File
                    </Label>
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
                              FEATURES_UPLOADER_MAX_SIZE
                            )} MB`}</p>

                            <Loading
                              visible={loading}
                              className="absolute left-0 top-0 z-40 flex h-full w-full items-center justify-center bg-gray-600 bg-opacity-90"
                              iconClassName="w-5 h-5 text-primary-500"
                            />
                          </div>

                          <div className="mt-2.5 flex items-center space-x-3">
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
                        </div>
                      )}
                    </FieldRFF>
                  </div>
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

                <div className="mt-16 flex justify-center space-x-6">
                  <Button theme="secondary" size="xl" onClick={onClose}>
                    Cancel
                  </Button>

                  <Button theme="primary" size="xl" type="submit">
                    Save
                  </Button>
                </div>
              </div>
            </form>
          );
        }}
      />
      <Loading
        visible={loading}
        className="absolute left-0 top-0 z-40 flex h-full w-full items-center justify-center bg-white bg-opacity-90"
        iconClassName="w-5 h-5 text-primary-500"
      />
    </Modal>
  );
};

export default FeatureUploadModal;
