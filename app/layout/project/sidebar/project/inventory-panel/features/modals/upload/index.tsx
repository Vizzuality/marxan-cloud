import React, {
  ElementRef,
  InputHTMLAttributes,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useDropzone, DropzoneProps } from 'react-dropzone';
import { Form as FormRFF, Field as FieldRFF, FormProps } from 'react-final-form';
import { useQueryClient } from 'react-query';

import { useRouter } from 'next/router';

import { AxiosError, isAxiosError } from 'axios';
import { motion } from 'framer-motion';

import { useUploadFeaturesCSV, useUploadFeaturesShapefile } from 'hooks/features';
import { useDownloadShapefileTemplate, useSaveProject } from 'hooks/projects';
import { useProjectTags } from 'hooks/projects';
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
import UploadTabs from 'components/upload-tabs';
import {
  FEATURES_UPLOADER_SHAPEFILE_MAX_SIZE,
  FEATURES_UPLOADER_CSV_MAX_SIZE,
} from 'constants/file-uploader-size-limits';
import UploadFeaturesInfoButtonContent from 'layout/info/upload-features';
import { Feature } from 'types/api/feature';
import { cn } from 'utils/cn';
import { bytesToMegabytes } from 'utils/units';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

export type FormValues = {
  name: string;
  file: File;
  tag: Feature['tag'];
};

export const FeatureUploadModal = ({
  isOpen = false,
  onDismiss,
}: {
  isOpen?: boolean;
  onDismiss: () => void;
}): JSX.Element => {
  const formRef = useRef<FormProps<FormValues>['form']>(null);
  const tagsSectionRef = useRef<ElementRef<'div'>>(null);
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  const [successFile, setSuccessFile] = useState<{ name: FormValues['name'] }>(null);
  const [uploadMode, saveUploadMode] = useState<'shapefile' | 'csv'>('shapefile');
  const [tagsMenuOpen, setTagsMenuOpen] = useState(false);
  const [tagIsDone, setTagIsDone] = useState(false);

  const { query } = useRouter();
  const { pid } = query as { pid: string };

  const { addToast } = useToasts();

  const tagsQuery = useProjectTags(pid);

  const { mutate: mutateProject } = useSaveProject({
    requestConfig: {
      method: 'PATCH',
    },
  });

  const uploadFeaturesShapefileMutation = useUploadFeaturesShapefile({
    requestConfig: {
      method: 'POST',
    },
  });

  const uploadFeaturesCSVMutation = useUploadFeaturesCSV({});

  const downloadShapefileTemplateMutation = useDownloadShapefileTemplate();

  const UPLOADER_MAX_SIZE =
    uploadMode === 'shapefile'
      ? FEATURES_UPLOADER_SHAPEFILE_MAX_SIZE
      : FEATURES_UPLOADER_CSV_MAX_SIZE;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tagsSectionRef.current && !tagsSectionRef.current.contains(event.target)) {
        setTagsMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, []);

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
            message: `File is larger than ${bytesToMegabytes(UPLOADER_MAX_SIZE)} MB`,
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
      const { file, name, tag } = values;

      const data = new FormData();

      data.append('file', file);
      data.append('name', name);
      data.append('tagName', tag);

      const mutationResponse = {
        onSuccess: async () => {
          await queryClient.invalidateQueries(['project-tags', pid]);
          setSuccessFile({ ...successFile });
          onClose();

          addToast(
            'info-upload-feature-file',
            <>
              <h2 className="font-medium">Upload in progress</h2>
              <p className="text-sm">
                CSV file uploaded correctly. Starting features processing. This might take several
                minutes.
              </p>
            </>,
            {
              level: 'info',
            }
          );
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
            'error-upload-feature-csv',
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
      };

      if (uploadMode === 'shapefile') {
        mutateProject(
          {
            id: pid,
            data: {
              metadata: {
                lastJobCheck: new Date().getTime(),
              },
            },
          },
          {
            onSuccess: async () => {
              await queryClient.invalidateQueries(['project', pid]);
              uploadFeaturesShapefileMutation.mutate({ data, id: pid }, mutationResponse);
            },
          }
        );
      }

      if (uploadMode === 'csv') {
        uploadFeaturesCSVMutation.mutate({ data, id: pid }, mutationResponse);
      }
    },
    [
      pid,
      addToast,
      onClose,
      uploadMode,
      uploadFeaturesShapefileMutation,
      uploadFeaturesCSVMutation,
      successFile,
      queryClient,
      mutateProject,
    ]
  );

  const handleKeyPress = useCallback(
    (event: Parameters<InputHTMLAttributes<HTMLInputElement>['onKeyDown']>[0]) => {
      formRef.current.change('tag', event.currentTarget.value);

      if (event.key === 'Enter') {
        setTagIsDone(true);
        setTagsMenuOpen(false);
      }
    },
    [formRef]
  );

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    multiple: false,
    maxSize: UPLOADER_MAX_SIZE,
    onDropAccepted,
    onDropRejected,
  });

  const onDownloadTemplate = useCallback(() => {
    downloadShapefileTemplateMutation.mutate(
      { pid },
      {
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
  }, [pid, downloadShapefileTemplateMutation, addToast]);

  useEffect(() => {
    if (!isOpen) {
      setTagIsDone(false);
    }
  }, [setTagIsDone, isOpen]);

  return (
    <Modal id="features-upload" open={isOpen} size="narrow" onDismiss={onDismiss}>
      <FormRFF<FormValues>
        initialValues={{
          tag: '',
        }}
        ref={formRef}
        onSubmit={onUploadSubmit}
        render={({ form, handleSubmit, values }) => {
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

                <UploadTabs mode={uploadMode} onChange={(mode) => saveUploadMode(mode)} />
                {uploadMode === 'csv' && (
                  <p className="!mt-4 text-sm text-gray-900">
                    Please download and fill in the{' '}
                    <button
                      className="text-primary-500 underline hover:no-underline"
                      onClick={onDownloadTemplate}
                    >
                      shapefile template
                    </button>{' '}
                    before upload.
                  </p>
                )}

                {uploadMode === 'shapefile' && (
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
                )}

                {uploadMode === 'shapefile' && (
                  <div ref={tagsSectionRef}>
                    <FieldRFF name="tag">
                      {(fprops) => (
                        <Field id="tag" {...fprops} className="relative">
                          <Label
                            theme="light"
                            className="mb-3 font-heading text-xs font-semibold uppercase"
                          >
                            Add type
                          </Label>

                          {(!values.tag || !tagIsDone) && (
                            <div className="space-y-2">
                              <input
                                {...fprops.input}
                                className="h-10 w-full rounded-md border border-gray-600 px-3 text-gray-900 focus:border-none focus:outline-none focus:ring-1 focus:ring-blue-600"
                                placeholder="Type to pick or create tag..."
                                value={fprops.input.value}
                                onFocus={() => {
                                  setTagsMenuOpen(true);
                                }}
                                onKeyDown={handleKeyPress}
                              />

                              {tagsMenuOpen && tagsQuery.data?.length > 0 && (
                                <div className="w-full space-y-2.5 rounded-md bg-white p-4 font-sans text-gray-900 shadow-md">
                                  <div className="text-sm text-gray-900">Recent:</div>
                                  <div className="flex flex-wrap gap-2.5">
                                    {tagsQuery.data.map((tag) => (
                                      <button
                                        key={tag}
                                        className="inline-block rounded-2xl border border-yellow-700 bg-yellow-500/50 px-3 py-0.5"
                                        onClick={() => {
                                          form.change('tag', tag);
                                          setTagIsDone(true);
                                        }}
                                      >
                                        <p className="text-sm text-gray-900">{tag}</p>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {values.tag && tagIsDone && (
                            <div className="flex items-center space-x-1">
                              <div className="inline-block items-center space-x-2 rounded-2xl border border-yellow-700 bg-yellow-500/50 px-3 py-0.5 hover:bg-yellow-700">
                                <p className="text-sm text-gray-900">{values.tag}</p>
                              </div>
                              <button
                                className="group flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-gray-400 hover:bg-gray-600"
                                onClick={() => {
                                  form.change('tag', null);
                                  setTagIsDone(false);
                                }}
                              >
                                <Icon
                                  icon={CLOSE_SVG}
                                  className="h-2 w-2 text-gray-900  group-hover:text-white"
                                />
                              </button>
                            </div>
                          )}
                        </Field>
                      )}
                    </FieldRFF>
                  </div>
                )}

                {!successFile && (
                  <div>
                    <Label theme="light" className="mb-3 text-xs font-semibold uppercase">
                      File
                    </Label>
                    <FieldRFF name="file" validate={composeValidators([{ presence: true }])}>
                      {(props) => (
                        <div>
                          <div
                            {...props}
                            {...getRootProps()}
                            className={cn({
                              'relative w-full cursor-pointer rounded-lg border-[1.5px] border-dashed border-gray-400 bg-gray-200 bg-opacity-20 py-10 hover:bg-gray-200':
                                true,
                              'bg-gray-600': isDragActive,
                              'border-green-900': isDragAccept,
                              'border-red-900':
                                isDragReject || (props?.meta?.error && props?.meta?.touched),
                            })}
                          >
                            <input {...getInputProps()} />

                            <p className="text-center text-sm text-gray-600">
                              Drag and drop your{' '}
                              {uploadMode === 'shapefile' ? 'polygon data file' : 'feature file'}
                              <br />
                              or <b>click here</b> to upload
                            </p>

                            <p className="mt-2 text-center text-xxs text-gray-400">{`Recommended file size < ${bytesToMegabytes(
                              UPLOADER_MAX_SIZE
                            )} MB`}</p>

                            <Loading
                              visible={loading}
                              className="absolute left-0 top-0 z-40 flex h-full w-full items-center justify-center bg-gray-700 bg-opacity-90"
                              iconClassName="w-5 h-5 text-primary-500"
                            />
                          </div>

                          <div className="mt-2.5 flex items-center space-x-3">
                            <h5 className="text-xs text-gray-600">Supported formats</h5>
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
