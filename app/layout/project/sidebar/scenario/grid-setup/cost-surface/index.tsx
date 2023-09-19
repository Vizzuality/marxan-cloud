import { useCallback, useState } from 'react';

import { useDropzone, DropzoneProps } from 'react-dropzone';
import { Form, Field } from 'react-final-form';
import { useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { motion } from 'framer-motion';
import { usePlausible } from 'next-plausible';

import { useMe } from 'hooks/me';
import { useCanEditScenario } from 'hooks/permissions';
import { useDownloadShapefileTemplate } from 'hooks/projects';
import { useUploadCostSurface } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import { composeValidators } from 'components/forms/validations';
import Icon from 'components/icon';
import InfoButton from 'components/info-button';
import Loading from 'components/loading';
import Uploader from 'components/uploader';
import { COST_SURFACE_UPLOADER_MAX_SIZE } from 'constants/file-uploader-size-limits';
import Section from 'layout/section';
import { cn } from 'utils/cn';
import { bytesToMegabytes } from 'utils/units';

import COST_LAND_IMG from 'images/info-buttons/img_cost_surface_marine.png';
import COST_SEA_IMG from 'images/info-buttons/img_cost_surface_terrestrial.png';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

export const GridSetupCostSurface = (): JSX.Element => {
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successFile, setSuccessFile] = useState<{ name: string }>(null);

  const { addToast } = useToasts();
  const plausible = usePlausible();
  const { query } = useRouter();
  const { pid, sid } = query as { pid: string; sid: string };

  const dispatch = useDispatch();
  const scenarioSlice = getScenarioEditSlice(sid);
  const { setJob } = scenarioSlice.actions;

  const { data: user } = useMe();
  const editable = useCanEditScenario(pid, sid);
  const downloadShapefileTemplateMutation = useDownloadShapefileTemplate();
  const uploadMutation = useUploadCostSurface({
    requestConfig: {
      method: 'POST',
    },
  });

  const onDownload = useCallback(() => {
    downloadShapefileTemplateMutation.mutate(
      { pid },
      {
        onSuccess: () => {},
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

  const onDropAccepted = (acceptedFiles: Parameters<DropzoneProps['onDropAccepted']>[0]) => {
    setLoading(true);

    const f = acceptedFiles[0];
    console.info(f);

    const data = new FormData();
    data.append('file', f);

    uploadMutation.mutate(
      { id: `${sid}`, data },
      {
        onSuccess: ({ data: { data: g, meta } }) => {
          dispatch(setJob(new Date(meta.isoDate).getTime()));
          setLoading(false);
          setSuccessFile({ name: f.name });

          addToast(
            'success-upload-shapefile',
            <>
              <h2 className="font-medium">Success!</h2>
              <p className="text-sm">Cost surface uploaded</p>
            </>,
            {
              level: 'success',
            }
          );

          plausible('Upload cost surface', {
            props: {
              userId: `${user.id}`,
              userEmail: `${user.email}`,
              projectId: `${pid}`,
              scenarioId: `${sid}`,
            },
          });
        },
        onError: ({ response }) => {
          const { errors } = response.data;

          setLoading(false);
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
      }
    );
  };

  const onDropRejected = (rejectedFiles: Parameters<DropzoneProps['onDropRejected']>[0]) => {
    const r = rejectedFiles[0];

    // ? `file-too-large` backend error message is not friendly.
    // ? It'll display the max size in bytes which the average user may not understand.
    const errors = r.errors.map((error) => {
      return error.code === 'file-too-large'
        ? {
            ...error,
            message: `File is larger than ${bytesToMegabytes(COST_SURFACE_UPLOADER_MAX_SIZE)} MB`,
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

  const onUploadSubmit = useCallback(() => {}, []);

  const onUploadRemove = useCallback(() => {
    setSuccessFile(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    multiple: false,
    maxSize: COST_SURFACE_UPLOADER_MAX_SIZE,
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
      className="flex min-h-0 flex-col items-start justify-start overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Section>
        <div className="space-y-1">
          <span className="text-xs font-semibold text-blue-400">Grid Setup</span>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-medium">Cost surface</h3>
            <InfoButton theme="primary" className="bg-gray-300">
              <div>
                <h4 className="mb-2.5 font-heading text-lg">What is a Cost Surface?</h4>
                <div className="space-y-2">
                  <p>
                    Marxan aims to minimize socio-economic impacts and conflicts between uses
                    through what is called the “cost” surface. In conservation planning, cost data
                    may reflect acquisition, management, or opportunity costs ($), but may also
                    reflect non-monetary impacts. Proxies are commonly used in absence of fine-scale
                    socio-economic information. A default value for cost will be the planning unit
                    area but you can upload your cost surface.
                  </p>
                  <p>
                    In the examples below, we illustrate how distance from a city, road or port can
                    be used as a proxy cost surface. In these examples, areas with many competing
                    activities will make a planning unit cost more than areas further away with less
                    competition for access.
                  </p>
                  <img src={COST_SEA_IMG} alt="Cost sea" />
                  <img src={COST_LAND_IMG} alt="Cost Land" />
                </div>
              </div>
            </InfoButton>
          </div>
        </div>

        <div className="relative mt-1 flex min-h-0 w-full flex-grow flex-col overflow-hidden text-sm">
          <p className="pt-2">
            By default all projects have an equal area cost surface which means that planning units
            with the same area have the same cost
          </p>

          <div className="pt-5">
            <h4 className="mb-2">
              {editable && '1. '}
              Download cost template
            </h4>
            <Button theme="primary-alt" size="base" className="w-full" onClick={onDownload}>
              Download cost surface template
            </Button>
          </div>

          <div className="pt-5">
            {editable && <h4 className="mb-2">2. Upload cost template</h4>}
            {!editable && successFile && <h4 className="mb-2">Uploaded cost template</h4>}

            {editable && (
              <div className="mb-5 mt-3">
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
                              <h4 className="mb-5 font-heading text-lg text-black">
                                Upload shapefile
                              </h4>

                              {!successFile && (
                                <Field
                                  name="dropFile"
                                  validate={composeValidators([{ presence: true }])}
                                >
                                  {(props) => (
                                    <div>
                                      <div className="mb-2.5 flex items-center space-x-3">
                                        <h5 className="text-xs text-gray-400">Supported formats</h5>
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

                                      <div
                                        {...props}
                                        {...getRootProps()}
                                        className={cn({
                                          'relative w-full cursor-pointer border border-dotted border-gray-300 bg-gray-100 bg-opacity-20 py-10 hover:bg-gray-100':
                                            true,
                                          'bg-gray-500': isDragActive,
                                          'border-green-800': isDragAccept,
                                          'border-red-800':
                                            isDragReject ||
                                            (props?.meta?.error && props?.meta?.touched),
                                        })}
                                      >
                                        <input {...getInputProps()} />

                                        <p className="text-center text-sm text-gray-500">
                                          Drag and drop your polygon data file
                                          <br />
                                          or <b>click here</b> to upload
                                        </p>

                                        <p className="mt-2 text-center text-xxs text-gray-400">{`Recommended file size < ${bytesToMegabytes(
                                          COST_SURFACE_UPLOADER_MAX_SIZE
                                        )} MB`}</p>

                                        <Loading
                                          visible={loading}
                                          className="absolute left-0 top-0 z-40 flex h-full w-full items-center justify-center bg-gray-600 bg-opacity-90"
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
                                  <div className="flex w-full cursor-pointer flex-col space-y-3">
                                    <h5 className="text-xs uppercase text-black">Uploaded file:</h5>
                                    <div className="flex items-center space-x-2">
                                      <label
                                        className="rounded-3xl bg-gray-400 bg-opacity-10 px-3 py-1"
                                        htmlFor="cancel-shapefile-btn"
                                      >
                                        <p className="text-sm text-black">{successFile.name}</p>
                                      </label>
                                      <button
                                        id="cancel-shapefile-btn"
                                        type="button"
                                        className="group flex h-5 w-5 items-center justify-center rounded-full border border-black hover:bg-black"
                                        onClick={onUploadRemove}
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
                                <Button
                                  theme="secondary"
                                  size="xl"
                                  onClick={() => setOpened(false)}
                                >
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
                  </Uploader>
                )}

                {successFile && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="flex w-full cursor-pointer flex-col space-y-6">
                      <div className="flex items-center space-x-2">
                        <label
                          className="rounded-3xl bg-blue-100 bg-opacity-10 px-3 py-1"
                          htmlFor="cancel-shapefile-btn"
                        >
                          <p className="text-sm text-primary-500">{successFile.name}</p>
                        </label>
                        <button
                          id="cancel-shapefile-btn"
                          type="button"
                          className="group flex h-5 w-5 items-center justify-center rounded-full border border-white hover:bg-black"
                          onClick={cancelCostSurfaceUpload}
                        >
                          {editable && (
                            <Icon
                              className="h-1.5 w-4.5 text-white group-hover:text-white"
                              icon={CLOSE_SVG}
                            />
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </Section>
    </motion.div>
  );
};

export default GridSetupCostSurface;
