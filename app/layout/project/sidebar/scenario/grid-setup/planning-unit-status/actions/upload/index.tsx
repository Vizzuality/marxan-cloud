import { useEffect, useState } from 'react';

import { useDropzone, DropzoneProps } from 'react-dropzone';
import { useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { HiOutlineArrowUpOnSquareStack } from 'react-icons/hi2';

import { useUploadScenarioPU } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';

import Icon from 'components/icon';
import InfoButton from 'components/info-button';
import Loading from 'components/loading';
import { PLANNING_UNIT_UPLOADER_MAX_SIZE } from 'constants/file-uploader-size-limits';
import { cn } from 'utils/cn';
import { bytesToMegabytes } from 'utils/units';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

export const UploadPUMethod = (): JSX.Element => {
  const { query } = useRouter();
  const { sid } = query as { sid: string };
  const { addToast } = useToasts();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [successFile, setSuccessFile] = useState<{ id: string; name: string }>(null);
  const scenarioSlice = getScenarioEditSlice(sid);
  const { setUploading, setUploadingValue } = scenarioSlice.actions;

  const onDropAccepted = (acceptedFiles: Parameters<DropzoneProps['onDropAccepted']>[0]) => {
    setLoading(true);
    const f = acceptedFiles[0];

    const data = new FormData();
    data.append('file', f);

    dispatch(setUploading(true));

    uploadScenarioPUMutation.mutate(
      { id: `${sid}`, data },
      {
        onSuccess: ({ data: { data: g } }) => {
          setSuccessFile({ id: g.id, name: f.name });

          addToast(
            'success-upload-shapefile',
            <>
              <h2 className="font-medium">Success!</h2>
              <p className="text-sm">Shapefile uploaded</p>
            </>,
            {
              level: 'success',
            }
          );

          const features = g.features.map((fe) => {
            if (fe?.geometry?.type === 'MultiPolygon') {
              const polygons = fe.geometry.coordinates.map((c) => {
                return {
                  type: 'Feature',
                  geometry: {
                    coordinates: c,
                    type: 'Polygon',
                  },
                  properties: fe.properties || {},
                };
              });

              return polygons;
            }

            return {
              ...fe,
              properties: fe.properties || {},
            };
          });

          const isMulti = features.every((fe) => {
            return Array.isArray(fe);
          });

          const validGeoJSON = {
            ...g,
            features: isMulti ? features.flat() : features,
          };

          dispatch(setUploadingValue(validGeoJSON));
          console.info('Shapefile uploaded', g);
        },
        onError: ({ response }) => {
          const { errors } = response.data;

          setSuccessFile(null);

          addToast(
            'error-upload-shapefile',
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
        onSettled: () => {
          setLoading(false);
        },
      }
    );
  };

  const onDropRejected = (rejectedFiles: Parameters<DropzoneProps['onDropRejected']>[0]) => {
    const r = rejectedFiles[0];

    // `file-too-large` backend error message is not friendly.
    // It'll display the max size in bytes which the average user may not understand.
    const errors = r.errors.map((error) => {
      return error.code === 'file-too-large'
        ? {
            ...error,
            message: `File is larger than ${bytesToMegabytes(PLANNING_UNIT_UPLOADER_MAX_SIZE)} MB`,
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

  const uploadScenarioPUMutation = useUploadScenarioPU({
    requestConfig: {
      method: 'POST',
    },
  });

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    multiple: false,
    maxSize: PLANNING_UNIT_UPLOADER_MAX_SIZE,
    onDropAccepted,
    onDropRejected,
  });

  useEffect(() => {
    dispatch(setUploading(true));

    return () => {
      setSuccessFile(null);
      dispatch(setUploading(false));
      dispatch(setUploadingValue(null));
    };
  }, []);

  return (
    <>
      <div
        {...getRootProps()}
        className={cn({
          'relative flex w-full cursor-pointer rounded-xl border border-dashed p-8 hover:bg-gray-600':
            true,
          'bg-gray-600': isDragActive,
          'border-green-900': isDragAccept,
          'border-red-900': isDragReject,
        })}
      >
        <input {...getInputProps()} />

        <div className="flex w-full flex-col items-center justify-center space-y-4">
          <HiOutlineArrowUpOnSquareStack className="h-6 w-6 stroke-current text-gray-100" />

          <p className="text-center text-sm font-medium text-white">
            Drag and drop your polygon data file <br /> or click here to upload
          </p>

          <p className="text-xs text-gray-100">{`Recommended file size < ${bytesToMegabytes(
            PLANNING_UNIT_UPLOADER_MAX_SIZE
          )} MB`}</p>
        </div>
        <Loading
          visible={loading}
          className="absolute left-0 top-0 z-40 flex h-full w-full items-center justify-center rounded-xl bg-gray-700 bg-opacity-90"
          iconClassName="w-10 h-5 text-primary-500"
        />
      </div>

      <p className="mt-2.5 flex items-center space-x-2 text-xs text-gray-400">
        <span className="text-xs text-gray-600">Supported formats and size</span>

        <InfoButton theme="primary" className="bg-gray-400">
          <div className="text-sm">
            <h3 className="font-semibold">List of supported file formats:</h3>
            <ul className="mt-2 list-outside list-disc space-y-1 pl-4">
              <li>
                Zipped: .shp (zipped shapefiles must include .shp, .shx, .dbf, and .prj files)
              </li>
            </ul>
          </div>
        </InfoButton>
      </p>

      {successFile && (
        <div>
          <div className="flex w-full cursor-pointer items-center space-x-8 py-5">
            <div className="flex items-center space-x-2 ">
              <label
                className="rounded-3xl bg-blue-500 bg-opacity-10 px-2.5 py-px"
                htmlFor="cancel-shapefile-btn"
              >
                <p className="text-sm text-blue-500">{successFile.name}</p>
              </label>
              <button
                id="cancel-shapefile-btn"
                type="button"
                className="group flex h-5 w-5 items-center justify-center rounded-full border border-white border-opacity-20 hover:bg-white"
                onClick={() => {
                  setSuccessFile(null);
                }}
              >
                <Icon className="h-1.5 w-1.5 text-white group-hover:text-black" icon={CLOSE_SVG} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UploadPUMethod;
