import React, { useCallback, useState } from 'react';

import { useDropzone } from 'react-dropzone';
import { Form, Field } from 'react-final-form';

import { useRouter } from 'next/router';

import cx from 'classnames';
import { motion } from 'framer-motion';

import { useDownloadCostSurface, useUploadCostSurface } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import { composeValidators } from 'components/forms/validations';
import Icon from 'components/icon';
import InfoButton from 'components/info-button';
import Loading from 'components/loading';
import Uploader from 'components/uploader';

import COST_LAND_IMG from 'images/info-buttons/img_cost_surface_marine.png';
import COST_SEA_IMG from 'images/info-buttons/img_cost_surface_terrestrial.png';

import ARROW_LEFT_SVG from 'svgs/ui/arrow-right-2.svg?sprite';
import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

export interface ScenariosCostSurfaceProps {
  onChangeSection: (s: string) => void;
}

export const ScenariosCostSurface: React.FC<ScenariosCostSurfaceProps> = ({
  onChangeSection,
}: ScenariosCostSurfaceProps) => {
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successFile, setSuccessFile] = useState(null);
  const { addToast } = useToasts();
  const { query } = useRouter();
  const { sid } = query;

  const maxSize = 1000000;

  const bytesToMb = (bytes) => {
    return (bytes / 1048576).toFixed(0);
  };

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
        setSuccessFile({ name: f.name });

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
        setSuccessFile(null);
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

  const onUploadSubmit = useCallback(() => {
  }, []);

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
    maxSize,
    onDropAccepted,
    onDropRejected,
  });

  const cancelCostSurfaceUpload = useCallback(() => {
    setSuccessFile(null);
    // resetCustomArea();
  }, []);

  return (
    <motion.div
      key="cost-surface"
      className="flex flex-col items-start justify-start min-h-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="flex items-center pt-5 pb-1 space-x-3">
        <button
          aria-label="return"
          type="button"
          className="flex items-center w-full space-x-2 text-left focus:outline-none"
          onClick={() => {
            onChangeSection(null);
          }}
        >
          <Icon icon={ARROW_LEFT_SVG} className="w-3 h-3 transform rotate-180 text-primary-500" />
          <h4 className="text-xs uppercase font-heading text-primary-500">Cost surface</h4>
        </button>
        <InfoButton>
          <div>
            <h4 className="font-heading text-lg mb-2.5">What is a Cost Surface?</h4>
            <div className="space-y-2">
              <p>
                In conservation planning, cost data reflects how much a
                planning unit costs to include into a
                conservation network. Typically, it reflects the
                actual price of a parcel of land.
              </p>
              <p>
                However, cost
                information is usually scarce and often the cost
                surface is used to reflect any variety of
                socioeconomic factors,
                which if minimized, might help the conservation
                plan be implemented more effectively and reduce
                conflicts with other uses.
              </p>
              <p>
                For example, here you can see 2 examples of
                cost surfaces in terrestrial and marine environments:
              </p>
              <img src={COST_SEA_IMG} alt="Cost sea" />
              <img src={COST_LAND_IMG} alt="Cost Land" />
              <p>
                The default value for cost will be the planning
                unit area but you can upload a cost
                surface. Once you upload a cost surface,
                it will be intersected with your planning unit
                grid to get one cost value per planning unit.
                This will be the cost that Marxan will use for
                each planning unit.
              </p>
            </div>

          </div>
        </InfoButton>
      </header>

      <div className="relative flex flex-col flex-grow w-full min-h-0 mt-1 overflow-hidden text-sm">
        <p className="pt-2">By default all projects have an equal area cost surface which means that planning units with the same area have the same cost</p>

        <div className="pt-5">
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

          <div className="mt-3 mb-5">
            {!successFile && (
              <Uploader
                caption="Upload cost surface"
                open={opened}
                onOpen={() => setOpened(true)}
                onClose={() => setOpened(false)}
              >
                <Form
                  onSubmit={onUploadSubmit}
                  render={({ handleSubmit }) => {
                    return (
                      <form onSubmit={handleSubmit}>
                        <div className="p-9">
                          <h4 className="mb-5 text-lg text-black font-heading">Upload shapefile</h4>

                          {!successFile && (
                          <Field name="dropFile" validate={composeValidators([{ presence: true }])}>
                            {(props) => (
                              <div>
                                <div className="flex items-center mb-2.5 space-x-3">
                                  <h5 className="text-xs text-gray-400">Supported formats</h5>
                                  <InfoButton
                                    size="s"
                                    theme="secondary"
                                  >
                                    <span className="text-xs">
                                      {' '}
                                      <h4 className="font-heading mb-2.5">
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
                                    Drag and drop your polygon data file
                                    <br />
                                    or
                                    {' '}
                                    <b>click here</b>
                                    {' '}
                                    to upload
                                  </p>

                                  <p className="mt-2 text-center text-gray-400 text-xxs">{`Recommended file size < ${bytesToMb(maxSize)} MB`}</p>

                                  <Loading
                                    visible={loading}
                                    className="absolute top-0 left-0 z-40 flex items-center justify-center w-full h-full bg-gray-600 bg-opacity-90"
                                    iconClassName="w-5 h-5 text-primary-500"
                                  />

                                </div>
                              </div>
                            )}
                          </Field>
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
                                    <p className="text-sm text-black">{successFile.name}</p>
                                  </label>
                                  <button
                                    id="cancel-shapefile-btn"
                                    type="button"
                                    className="flex items-center justify-center w-5 h-5 border border-black rounded-full group hover:bg-black"
                                    onClick={onUploadRemove}
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

                          <div className="flex justify-center mt-16 space-x-6">
                            <Button
                              theme="secondary"
                              size="xl"
                              onClick={() => setOpened(false)}
                            >
                              Cancel
                            </Button>

                            <Button
                              theme="primary"
                              size="xl"
                              type="submit"
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      </form>
                    );
                  }}
                />
              </Uploader>
            )}

            {successFile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex flex-col w-full space-y-6 cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <label className="px-3 py-1 bg-blue-100 bg-opacity-10 rounded-3xl" htmlFor="cancel-shapefile-btn">
                      <p className="text-sm text-primary-500">{successFile.name}</p>
                    </label>
                    <button
                      id="cancel-shapefile-btn"
                      type="button"
                      className="flex items-center justify-center w-5 h-5 border border-white rounded-full group hover:bg-black"
                      onClick={cancelCostSurfaceUpload}
                    >
                      <Icon
                        className="w-4.5 h-1.5 text-white group-hover:text-white"
                        icon={CLOSE_SVG}
                      />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default ScenariosCostSurface;
