import React, { useEffect, useState } from 'react';

import { useDropzone } from 'react-dropzone';
import { useDispatch } from 'react-redux';

import {
  setBbox, setUploadingPlanningArea, setMaxPuAreaSize, setMinPuAreaSize,
} from 'store/slices/projects/new';

import cx from 'classnames';
import { motion } from 'framer-motion';

import { useUploadProjectPA } from 'hooks/projects';
import { useToasts } from 'hooks/toast';

import Icon from 'components/icon';
import InfoButton from 'components/info-button';
import Loading from 'components/loading';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

export interface ProtectedAreaUploaderProps {
  input: any;
  meta: any;
  resetProtectedArea?: any,
  form: any,
}

export const ProtectedAreaUploader: React.FC<ProtectedAreaUploaderProps> = ({
  input,
  meta,
  resetProtectedArea,
  form,
}: ProtectedAreaUploaderProps) => {
  const [loading, setLoading] = useState(false);
  const [successFile, setSuccessFile] = useState(null);
  const { addToast } = useToasts();

  const { submitFailed, valid } = meta;

  const dispatch = useDispatch();

  const uploadProjectPAMutation = useUploadProjectPA({
    requestConfig: {
      method: 'POST',
    },
  });

  // Effects
  useEffect(() => {
    return () => {
      input.onChange(null);
      dispatch(setUploadingPlanningArea(null));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDropAccepted = async (acceptedFiles) => {
    setLoading(true);
    const f = acceptedFiles[0];

    const data = new FormData();
    data.append('file', f);

    uploadProjectPAMutation.mutate({ data }, {
      onSuccess: ({ data: { data: g, id: PAid } }) => {
        const mockMinPuAreaSize = 251;
        const mockMaxPuAreaSize = 2311631;
        const mockBbox = [
          4.21875,
          14.150390625,
          2.8113711933311403,
          12.811801316582619,
        ];

        setLoading(false);
        input.onChange(PAid);

        addToast('success-upload-protected-area', (
          <>
            <h2 className="font-medium">Success!</h2>
            <p className="text-sm">Protected area uploaded</p>
          </>
        ), {
          level: 'success',
        });

        dispatch(setUploadingPlanningArea(g));
        dispatch(setBbox(mockBbox));
        dispatch(setMinPuAreaSize(mockMinPuAreaSize));
        dispatch(setMaxPuAreaSize(mockMaxPuAreaSize));

        console.info('Protected area uploaded', g);
      },
      onError: () => {
        setLoading(false);
        setSuccessFile(null);

        addToast('error-upload-protected-area', (
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">Protected area could not be uploaded</p>
          </>
        ), {
          level: 'error',
        });
      },
    });
  };

  const onDropRejected = (rejectedFiles) => {
    const r = rejectedFiles[0];
    const { errors } = r;

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

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    multiple: false,
    maxSize: 3000000,
    onDropAccepted,
    onDropRejected,
  });

  return (
    <div
      key="uploading"
      role="presentation"
      className={cx({
        'border text-sm py-2.5 focus:outline-none relative transition rounded-3xl  cursor-pointer text-white': true,
        'border-red-500 bg-gray-600 px-5': submitFailed,
        'bg-gray-600 px-5': !submitFailed,
      })}
    >
      <header className="relative flex justify-between w-full">

        <div
          className={cx({
            'text-left': true,
            'text-gray-300': !submitFailed && valid,
          })}
        >
          {successFile ? 'Uploaded protected area' : 'Upload your protected area network'}
        </div>
      </header>

      {!successFile && (
        <div className="pt-2">
          <div
            {...getRootProps()}
            className={cx({
              'relative px-5 py-3 w-full border border-dotted hover:bg-gray-500 cursor-pointer': true,
              'bg-gray-500': isDragActive,
              'border-green-800': isDragAccept,
              'border-red-800': isDragReject,
            })}
          >

            <input {...getInputProps()} />

            <p className="text-sm text-gray-300">
              Drag and drop your
              {' '}
              <b>polygon data file</b>
              {' '}
              or click here to upload
            </p>

            <p className="mt-2 text-gray-300 text-xxs">{'Recommended file size < 3 MB'}</p>

            <Loading
              visible={loading}
              className="absolute top-0 left-0 z-40 flex items-center justify-center w-full h-full bg-gray-600 bg-opacity-90"
              iconClassName="w-5 h-5 text-primary-500"
            />

          </div>

          <p className="flex items-center space-x-2 text-xs text-gray-300 mt-2.5">
            <span>Learn more about supported file formats</span>
            <InfoButton
              theme="secondary"
            >
              <div className="text-sm">
                <h3 className="font-semibold">List of supported file formats:</h3>
                <ul className="pl-4 mt-2 space-y-1 list-disc list-outside">
                  <li>
                    Zipped: .shp
                    (zipped shapefiles must include .shp, .shx, .dbf, and .prj files)
                  </li>
                </ul>
              </div>
            </InfoButton>
          </p>

        </div>
      )}

      {successFile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex items-center w-full py-5 space-x-8 cursor-pointer">
            <div className="flex items-center space-x-2 ">
              <label className="px-2.5 py-px bg-blue-500 bg-opacity-10 rounded-3xl" htmlFor="cancel-shapefile-btn">
                <p className="text-sm text-blue-500">{successFile.name}</p>
              </label>
              <button
                id="cancel-shapefile-btn"
                type="button"
                className="flex items-center justify-center w-5 h-5 border border-white rounded-full group hover:bg-white border-opacity-20"
                onClick={() => {
                  setSuccessFile(null);
                  input.onChange(null);
                  resetProtectedArea(form);
                }}
              >
                <Icon
                  className="w-1.5 h-1.5 text-white group-hover:text-black"
                  icon={CLOSE_SVG}
                />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProtectedAreaUploader;
