import React, { useCallback, useState } from 'react';
import cx from 'classnames';

import { motion } from 'framer-motion';

import Icon from 'components/icon';
import Button from 'components/button';
import Loading from 'components/loading';
import InfoButton from 'components/info-button';

import { useDropzone } from 'react-dropzone';
import { useToasts } from 'hooks/toast';
import { useRouter } from 'next/router';
import { useDownloadCostSurface, useUploadCostSurface } from 'hooks/scenarios';

import ARROW_LEFT_SVG from 'svgs/ui/arrow-right-2.svg?sprite';

export interface ScenariosCostSurfaceProps {
  onChangeSection: (s: string) => void;
}

export const ScenariosCostSurface: React.FC<ScenariosCostSurfaceProps> = ({
  onChangeSection,
}: ScenariosCostSurfaceProps) => {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToasts();
  const { query } = useRouter();
  const { sid } = query;

  const downloadMutation = useDownloadCostSurface({});
  const uploadMutation = useUploadCostSurface({
    requestConfig: {
      method: 'POST',
    },
  });

  const onDownload = useCallback(() => {
    downloadMutation.mutate({ id: `${sid}` }, {
      onSuccess: () => {

      },
      onError: () => {
        addToast('download-error', (
          <>
            <h2 className="font-medium">Error!</h2>
            <ul className="text-sm">
              Template not downloaded
            </ul>
          </>
        ), {
          level: 'error',
        });
      },
    });
  }, [sid, downloadMutation, addToast]);

  const onDropAccepted = async (acceptedFiles) => {
    setLoading(true);
    const f = acceptedFiles[0];
    console.info(f);

    const data = new FormData();
    data.append('file', f);

    uploadMutation.mutate({ id: `${sid}`, data }, {
      onSuccess: ({ data: { data: g } }) => {
        setLoading(false);

        addToast('success-upload-shapefile', (
          <>
            <h2 className="font-medium">Success!</h2>
            <p className="text-sm">Cost surface uploaded</p>
          </>
        ), {
          level: 'success',
        });

        console.info('Cost surface uploaded', g);
      },
      onError: () => {
        setLoading(false);
        addToast('error-upload-shapefile', (
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">Cost surface could not be uploaded</p>
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
    getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject,
  } = useDropzone({
    // accept: 'image/*',
    multiple: false,
    maxSize: 1000000,
    onDropAccepted,
    onDropRejected,
  });

  return (
    <motion.div
      key="cost-surface"
      className="flex flex-col items-start justify-start min-h-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header>
        <button
          type="button"
          className="flex items-center w-full pt-5 pb-1 space-x-2 text-left focus:outline-none"
          onClick={() => {
            onChangeSection(null);
          }}
        >
          <Icon icon={ARROW_LEFT_SVG} className="w-3 h-3 transform rotate-180 text-primary-500" />
          <h4 className="text-xs uppercase font-heading">Cost surface</h4>
        </button>
        <InfoButton>
          <div>
            <h4 className="font-heading text-lg mb-2.5">What is a Cost Surface?</h4>
            <div>

              In conservation planning, cost data reflects how much a
              planning unit costs to include into a
              conservation network. Typically, it reflects the
              actual price of a parcel of land. However, cost
              information is usually scarce and often the cost
              surface is used to reflect any variety of
              socioeconomic factors,
              which if minimized, might help the conservation
              plan be implemented more effectively and reduce
              conflicts with other uses.
              <br />
              <br />
              The default value for cost will be the planning
              unit area but you can upload a cost
              surface. Once you upload a cost surface,
              it will be intersected with your planning unit
              grid to get one cost value per planning unit.
              This will be the cost that Marxan will use for
              each planning unit.

            </div>

          </div>
        </InfoButton>
      </header>

      <div className="relative flex flex-col flex-grow w-full min-h-0 mt-1 overflow-hidden text-sm">
        <div className="pt-2">
          <h4 className="mb-2">1. Download the current cost surface</h4>
          <Button
            theme="primary-alt"
            size="base"
            className="w-full"
            onClick={onDownload}
          >
            Template
          </Button>
        </div>

        <div className="pt-5">
          <h4 className="mb-2">2. Upload your cost surface</h4>
          <div
            {...getRootProps()}
            className={cx({
              'dropzone px-5 py-3 w-full border border-dotted hover:bg-gray-500 cursor-pointer': true,
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

            <Loading
              visible={loading}
              className="absolute top-0 left-0 z-40 flex items-center justify-center w-full h-full bg-gray-600 bg-opacity-90"
              iconClassName="w-5 h-5 text-primary-500"
            />

            <p className="mt-2 text-gray-300 text-xxs">{'Recommended file size < 1 MB'}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ScenariosCostSurface;
