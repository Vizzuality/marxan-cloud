import React, { useCallback, useRef, useState } from 'react';

import { useDropzone } from 'react-dropzone';
import { Field as FieldRFF, Form as FormRFF } from 'react-final-form';
import { useSelector } from 'react-redux';

import cx from 'classnames';
import { motion } from 'framer-motion';
import { bytesToMegabytes } from 'utils/units';

import { useUploadLegacyProjectFile, useCancelUploadLegacyProjectFile } from 'hooks/projects';
import { useToasts } from 'hooks/toast';

import Label from 'components/forms/label';
import Icon from 'components/icon';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

export interface UploadItemProps {
  f: {
    label: string;
    maxSize: number;
    format: string;
    fileType: string;
    optional: boolean;
  };
}

export const UploadItem: React.FC<UploadItemProps> = ({
  f,
}: UploadItemProps) => {
  const formRef = useRef(null);

  const [successFile, setSuccessFile] = useState(null);
  const [dataFileId, setDataFileId] = useState(null);

  const { addToast } = useToasts();

  const { legacyProjectId } = useSelector((state) => state['/projects/new']);

  const uploadLegacyProjectFileMutation = useUploadLegacyProjectFile({});
  const cancelUploadLegacyProjectFileMutation = useCancelUploadLegacyProjectFile({});

  // ADD DATA FILE
  const onDropAccepted = async (acceptedFiles) => {
    const fl = acceptedFiles[0];

    setSuccessFile(fl);
    formRef.current.change('file', fl);
    const data = new FormData();
    data.append('fileType', f.fileType);
    data.append('file', fl);

    uploadLegacyProjectFileMutation.mutate({ data, projectId: legacyProjectId }, {
      onSuccess: ({ data: { fileId } }) => {
        setDataFileId(fileId);
      },
      onError: ({ response }) => {
        const { errors } = response.data;

        addToast('error-upload-legacy-data-file', (
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
      // TODO: Read mazSize per each field
      return error.code === 'file-too-large'
        ? { error, message: `File is larger than ${bytesToMegabytes(f.maxSize)} MB` }
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

  const onUploadRemove = useCallback(() => {
    setSuccessFile(null);
    cancelUploadLegacyProjectFileMutation.mutate({ projectId: legacyProjectId, dataFileId }, {
      onSuccess: ({ data: { projectId } }) => {
        console.info('Upload legacy project data file has been canceled', projectId);
      },
      onError: () => {
        console.error('Upload legacy project data file has not been canceled');
      },
    });
  }, [cancelUploadLegacyProjectFileMutation, dataFileId, legacyProjectId]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    multiple: false,
    maxSize: f.maxSize,
    onDropAccepted,
    onDropRejected,
  });

  return (
    <FormRFF
      onSubmit={() => { }}
      render={({ form, handleSubmit }) => {
        formRef.current = form;

        return (
          <form onSubmit={handleSubmit}>
            {!successFile && (
              <FieldRFF name="file">
                {(props) => (
                  <div className="space-y-2.5">
                    <Label theme="light" className="uppercase" id="file">
                      {`Upload your ${f.label}`}
                      {' '}
                      <span className="lowercase">
                        {`(${f.fileType})`}
                      </span>
                      {' '}
                      {`${f.optional ? '(optional)' : ''}`}
                    </Label>

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
                        {`Drag and drop your project ${f.format}`}
                        <br />
                        or
                        {' '}
                        <b>click here</b>
                        {' '}
                        to upload
                      </p>

                      <p className="mt-2 text-center text-gray-400 text-xxs">{`Recommended file size < ${bytesToMegabytes(f.maxSize)} MB`}</p>
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
                  <h5 className="text-xs text-black uppercase">
                    Uploaded
                    {' '}
                    {f.label}
                  </h5>
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
          </form>
        );
      }}
    />
  );
};

export default UploadItem;
