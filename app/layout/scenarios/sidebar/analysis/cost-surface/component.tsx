import React from 'react';
import cx from 'classnames';

import { motion } from 'framer-motion';

import Icon from 'components/icon';
import Button from 'components/button';

import { useDropzone } from 'react-dropzone';
import { useToasts } from 'hooks/toast';

import ARROW_LEFT_SVG from 'svgs/ui/arrow-right-2.svg?sprite';

export interface ScenariosCostSurfaceProps {
  onChangeSection: (s: string) => void;
}

export const ScenariosCostSurface: React.FC<ScenariosCostSurfaceProps> = ({
  onChangeSection,
}: ScenariosCostSurfaceProps) => {
  const { addToast } = useToasts();

  const onDropAccepted = async (acceptedFiles) => {
    const f = acceptedFiles[0];
    console.info(f);
    // const url = await toBase64(f);
    // setPreview(`${url}`);
    // onChange(`${url}`);
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
      </header>

      <div className="relative flex flex-col flex-grow w-full min-h-0 mt-1 overflow-hidden text-sm">
        <div className="pt-2">
          <h4 className="mb-2">1. Download the current cost surface</h4>
          <Button
            theme="primary-alt"
            size="s"
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

            <p className="mt-2 text-gray-300 text-xxs">{'Recommended file size < 1 MB'}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ScenariosCostSurface;
