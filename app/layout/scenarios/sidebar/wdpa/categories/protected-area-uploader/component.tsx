import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import cx from 'classnames';

import { useDispatch, useSelector } from 'react-redux';

import { getScenarioSlice } from 'store/slices/scenarios/edit';

import { useDropzone } from 'react-dropzone';
import { useToasts } from 'hooks/toast';
import { useUploadProtectedArea } from 'hooks/scenarios';

import InfoButton from 'components/info-button';
import Loading from 'components/loading';

export interface ProtectedAreaUploaderProps {
  input: any;
  meta: any;
  form: any;
}

export const ProtectedAreaUploader: React.FC<ProtectedAreaUploaderProps> = ({
  input,
  meta,
  // form,
}: ProtectedAreaUploaderProps) => {
  const [loading, setLoading] = useState(false);
  const { query } = useRouter();
  const { pid, sid } = query;

  const scenarioSlice = getScenarioSlice(sid);
  const { setUploadingProtectedArea, setUploadingProtectedAreaFileNames } = scenarioSlice.actions;

  const {
    uploadingProtectedAreaFileNames,
  } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const { addToast } = useToasts();

  const { submitFailed } = meta;

  const dispatch = useDispatch();

  const uploadProtectedAreaMutation = useUploadProtectedArea({
    requestConfig: {
      method: 'POST',
    },
  });

  // Effects
  useEffect(() => {
    return () => {
      input.onChange(null);
      dispatch(setUploadingProtectedArea(null));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDropAccepted = async (acceptedFiles) => {
    setLoading(true);
    const f = acceptedFiles[0];

    const data = new FormData();
    data.append('file', f);

    uploadProtectedAreaMutation.mutate({
      data,
      id: `${pid}`,
    }, {
      onSuccess: ({ data: { data: g, id: protectedAreaId } }) => {
        setLoading(false);
        input.onChange(protectedAreaId);

        addToast('success-upload-protected-area', (
          <>
            <h2 className="font-medium">Success!</h2>
            <p className="text-sm">Protected area uploaded</p>
          </>
        ), {
          level: 'success',
        });

        dispatch(setUploadingProtectedArea(g));

        const fileToUpdate = {
          id: Math.random(),
          value: f.name,
        };
        const filesArrayToUpdate = [...uploadingProtectedAreaFileNames, fileToUpdate];
        dispatch(setUploadingProtectedAreaFileNames(filesArrayToUpdate));

        console.info('Protected area uploaded', g);
      },
      onError: () => {
        setLoading(false);

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
            'text-gray-300': !submitFailed,
          })}
        >
          Upload your protected area network
        </div>
      </header>

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

    </div>
  );
};

export default ProtectedAreaUploader;
