import React, { useCallback, useRef, useState } from 'react';

import { PROJECT_UPLOADER_MAX_SIZE } from 'constants/file-uploader-size-limits';
import { useDropzone } from 'react-dropzone';
import { Field as FieldRFF, Form as FormRFF } from 'react-final-form';
import { useSelector } from 'react-redux';

import cx from 'classnames';
import { motion } from 'framer-motion';
import { bytesToMegabytes } from 'utils/units';

import { useImportLegacyProject } from 'hooks/projects';
import { useToasts } from 'hooks/toast';

import Label from 'components/forms/label';
import Icon from 'components/icon';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

export interface UploadItemProps {
  file: {
    label: string;
    maxSize: number;
    format: string;
  };
}

export const UploadItem: React.FC<UploadItemProps> = ({
  file,
}: UploadItemProps) => {
  const formRef = useRef(null);

  const [successFile, setSuccessFile] = useState(null);

  const { addToast } = useToasts();

  const { legacyProjectId } = useSelector((state) => state['/projects/new']);

  const importLegacyMutation = useImportLegacyProject({});

  // ADD DATA FILE
  const onDropAccepted = async (acceptedFiles) => {
    const f = acceptedFiles[0];

    setSuccessFile(f);
    formRef.current.change('file', f);

    // const { file, name } = values;

    // const data = new FormData();
    // data.append('projectName', name);
    // data.append('file', file);
  };

  const onDropRejected = (rejectedFiles) => {
    const r = rejectedFiles[0];

    // `file-too-large` backend error message is not friendly.
    // It'll display the max size in bytes which the average user may not understand.
    const errors = r.errors.map((error) => {
      // TODO: Read mazSize per each field
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

  // SUBMIT FORM - IMPORT LEGACY
  const onImportSubmit = useCallback((values) => {
    const solutionsAreLocked = !!values.solutionsAreLocked;
    const data = { solutionsAreLocked };

    importLegacyMutation.mutate({ data, projectId: legacyProjectId }, {
      onSuccess: () => {
        addToast('success-upload-project', (
          <>
            <h2 className="font-medium">Success!</h2>
            <p className="text-sm">Project uploaded</p>
          </>
        ), {
          level: 'success',
        });
        console.info('Project uploaded');
      },
      onError: ({ response }) => {
        const { errors } = response.data;

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
    importLegacyMutation,
    legacyProjectId,
  ]);

  const onUploadRemove = useCallback(() => {
    setSuccessFile(null);
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    multiple: false,
    // TODO: Read mazSize per each field
    maxSize: PROJECT_UPLOADER_MAX_SIZE,
    onDropAccepted,
    onDropRejected,
  });

  return (
    <FormRFF
      onSubmit={onImportSubmit}
      render={({ form, handleSubmit }) => {
        formRef.current = form;

        return (
          <form onSubmit={handleSubmit}>
            {!successFile && (
              <FieldRFF name="file">
                {(props) => (
                  <div className="space-y-2.5">
                    <Label theme="light" className="uppercase" id="file">
                      {file.label}
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
                        {`Drag and drop your project ${file.format}`}
                        <br />
                        or
                        {' '}
                        <b>click here</b>
                        {' '}
                        to upload
                      </p>

                      <p className="mt-2 text-center text-gray-400 text-xxs">{`Recommended file size < ${bytesToMegabytes(file.maxSize)} MB`}</p>
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
          </form>
        );
      }}
    />
  );
};

export default UploadItem;
