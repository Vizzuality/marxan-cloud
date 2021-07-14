import React, {
  useCallback, /* useEffect,  useMemo, */ useState,
} from 'react';

import cx from 'classnames';

import InfoButton from 'components/info-button';
import Icon from 'components/icon';

import { Form as FormRFF } from 'react-final-form';

// import {  useSelector,  useDispatch } from 'react-redux';
// import { getScenarioSlice } from 'store/slices/scenarios/edit';

import { useDropzone } from 'react-dropzone';
import { useToasts } from 'hooks/toast';
import { useUploadProjectPU } from 'hooks/projects';

import UPLOAD_SVG from 'svgs/ui/upload.svg?sprite';
import Loading from 'components/loading';

export interface NewProjectUploadingProps {
  selected: boolean;
  onSelected: (s: string) => void;
}

export const NewProjectUploading: React.FC<NewProjectUploadingProps> = ({
  selected,
  onSelected,
}: NewProjectUploadingProps) => {
  const [loading, setLoading] = useState(false);
  const [successFileName, setSuccessFileName] = useState(null);
  const { addToast } = useToasts();

  console.log('success file name', successFileName);
  // const scenarioSlice = getScenarioSlice(sid);
  // const { setUploading, setUploadingValue } = scenarioSlice.actions;

  // const dispatch = useDispatch();
  // const { uploadingValue } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const uploadProjectPUMutation = useUploadProjectPU({
    requestConfig: {
      method: 'POST',
    },
  });

  // Effects
  // useEffect(() => {
  //   if (selected) {
  //     dispatch(setUploading(true));
  //   }

  //   if (!selected) {
  //     dispatch(setUploading(false));
  //     dispatch(setUploadingValue(null));
  //   }

  //   // Unmount
  //   return () => {
  //     dispatch(setUploading(false));
  //     dispatch(setUploadingValue(null));
  //   };
  // }, [selected]); // eslint-disable-line

  const onDropAccepted = async (acceptedFiles) => {
    setLoading(true);
    const f = acceptedFiles[0];

    const data = new FormData();
    data.append('file', f);

    uploadProjectPUMutation.mutate({ /* id: `${pid}`, */ data }, {
      onSuccess: ({ data: { data: g } }) => {
        setLoading(false);
        setSuccessFileName(f.name);

        addToast('success-upload-shapefile', (
          <>
            <h2 className="font-medium">Success!</h2>
            <p className="text-sm">Shapefile uploaded</p>
          </>
        ), {
          level: 'success',
        });

        // dispatch(setUploadingValue(g));
        console.info('Shapefile uploaded', g);
        // guardar redux geojson asociado con planning area id (g.id)
      },
      onError: () => {
        setLoading(false);
        setSuccessFileName(null);

        addToast('error-upload-shapefile', (
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">Shapefile could not be uploaded</p>
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
  // Callbacks
  const onSubmit = useCallback((values) => {
    // Save current drawn shape
    console.info(values);
  }, []);

  return (
    <FormRFF
      key="uploading-form"
      onSubmit={onSubmit}
    >
      {({ handleSubmit }) => (
        <form onSubmit={handleSubmit} autoComplete="off">
          <div
            key="uploading"
            role="presentation"
            className={cx({
              'text-sm py-2.5 focus:outline-none relative transition rounded-3xl px-10 cursor-pointer': true,
              'bg-gray-600 text-gray-200 opacity-50 hover:text-white hover:opacity-100': !selected,
              'bg-gray-600 text-white': selected,
            })}
            onClick={() => onSelected('uploading')}
          >
            <header className="relative flex justify-between w-full">
              <div
                className={cx({
                  'text-center': !selected,
                  'text-left': selected,
                })}
              >
                Upload shapefile
              </div>

              {!selected && (
                <Icon
                  className="absolute right-0 w-5 h-5 transform -translate-y-1/2 top-1/2"
                  icon={UPLOAD_SVG}
                />
              )}
            </header>

            {selected && !successFileName && (
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

            {selected && successFileName && (
            <div
              className="flex items-center w-full px-5 space-x-6 cursor-pointer py-9"
            >
              <Icon
                className="w-5 h-5 transform"
                icon={UPLOAD_SVG}
              />
              <p className="mt-2 text-sm text-gray-300">{successFileName}</p>
              <button type="button" onClick={() => setSuccessFileName(false)}>Cancel</button>
            </div>
            )}

          </div>
        </form>
      )}
    </FormRFF>
  );
};

export default NewProjectUploading;
