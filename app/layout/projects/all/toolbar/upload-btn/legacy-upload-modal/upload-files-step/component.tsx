import React, { useCallback, useRef, useState } from 'react';

import { PROJECT_UPLOADER_MAX_SIZE } from 'constants/file-uploader-size-limits';
import { useDropzone } from 'react-dropzone';
import { Field as FieldRFF, Form as FormRFF } from 'react-final-form';
import { useDispatch, useSelector } from 'react-redux';

import { setLegacyProjectId } from 'store/slices/projects/new';

import cx from 'classnames';
import { motion } from 'framer-motion';
import { bytesToMegabytes } from 'utils/units';

import { useCancelImportLegacyProject, useImportProject } from 'hooks/projects';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import Checkbox from 'components/forms/checkbox';
import Field from 'components/forms/field';
import Label from 'components/forms/label';
import Icon from 'components/icon';
import InfoButton from 'components/info-button';
import Loading from 'components/loading';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

import { LEGACY_FIELDS } from './constants';

export interface UploadFilesStepProps {
  onDismiss: () => void;
  setStep: (step: number) => void;
}

export const UploadFilesStep: React.FC<UploadFilesStepProps> = ({
  onDismiss,
  setStep,
}: UploadFilesStepProps) => {
  const formRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const [successFile, setSuccessFile] = useState(null);

  const { addToast } = useToasts();
  const dispatch = useDispatch();

  const { legacyProjectId } = useSelector((state) => state['/projects/new']);

  const cancelLegacyProjectMutation = useCancelImportLegacyProject({});

  const onCancelImportLegacyProject = useCallback(() => {
    cancelLegacyProjectMutation.mutate({ projectId: legacyProjectId }, {
      onSuccess: () => {
        dispatch(setLegacyProjectId(null));
        console.info('Import legacy project has been canceled');
      },
      onError: () => {
        console.error('Scenario not canceled');
      },
    });
  }, [cancelLegacyProjectMutation, dispatch, legacyProjectId]);

  const importMutation = useImportProject({});

  const onDropAccepted = async (acceptedFiles) => {
    const f = acceptedFiles[0];

    setSuccessFile(f);
    formRef.current.change('file', f);
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

  const onImportSubmit = useCallback((values) => {
    const solutionsAreLocked = !!values.solutionsAreLocked;
    console.info({ solutionsAreLocked });
    setLoading(true);
    const { file, name } = values;

    const data = new FormData();
    data.append('projectName', name);
    data.append('file', file);

    importMutation.mutate({ data }, {
      onSuccess: () => {
        setLoading(false);
        addToast('success-upload-project', (
          <>
            <h2 className="font-medium">Success!</h2>
            <p className="text-sm">Project uploaded</p>
          </>
        ), {
          level: 'success',
        });
        onDismiss();
        setStep(2);
        console.info('Project uploaded');
      },
      onError: ({ response }) => {
        const { errors } = response.data;

        setLoading(false);

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
    importMutation,
    onDismiss,
    setStep,
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
    <div className="mt-3 mb-5">

      <FormRFF
        onSubmit={onImportSubmit}
        render={({ form, handleSubmit }) => {
          formRef.current = form;

          return (
            <form onSubmit={handleSubmit}>
              <div className="p-9">

                <div className="flex space-x-2">
                  <h4 className="mb-5 text-lg text-black font-heading">Upload legacy project</h4>
                  <InfoButton
                    theme="primary"
                  >
                    <div>
                      <h4 className="font-heading text-lg mb-2.5">
                        When uploading planning unit grid and input db
                      </h4>
                      <p>
                        This may be the case when users are transitioning a legacy project to the
                        Marxan MaPP platform (rather than making it available as an historical
                        archive, for example).
                      </p>
                      <br />
                      <ul className="pl-6 space-y-1 list-disc list-outside">
                        <li>
                          Users will not be able to add, remove or combine (split/stratification)
                          features;
                        </li>
                        <li>
                          the exact spatial distribution of features will not be available for
                          display;
                        </li>
                        <li>
                          planning unit lock status will be set from input `pu.dat`, but without
                          first adding  spatial data for protected areas, users won&apos;t be able
                          to rely on protected areas to set the default lock status of planning
                          units.
                        </li>
                      </ul>
                      <br />

                      <h4 className="font-heading text-lg mb-2.5">
                        When uploading planning unit grid, input db and output db
                      </h4>
                      <p>
                        This may be the case when users intend to upload a historical project to be
                        shared in  its archived state.
                      </p>
                      <br />
                      <ul className="pl-6 space-y-1 list-disc list-outside">
                        <li>
                          dentical limitations to what was described in the previous use case will
                          apply (in case users wish to continue working on the project within the
                          Marxan MaPP platform);
                        </li>
                        <li>
                          output data may be locked (i.e. running Marxan will be disallowed) if the
                          user wishes to preserve a historical record of solutions calculated
                          outside of the Marxan MaPP platform.
                        </li>
                      </ul>
                      <br />

                      <h4 className="font-heading text-lg mb-2.5">
                        When uploading planning unit grid, input db, output db and feature data
                      </h4>
                      <p>
                        This may be the case when users intend to transition to using Marxan MaPP
                        for an existing project for which extensive source data is available; they
                        may wish to showcase an historical record of the project as created
                        outside of Marxan MaPP (by keeping the original output solutions intact),
                        while working on a copy of the original project as a new scenario or set
                        of scenarios, adding any further spatial data directly within the Marxan
                        MaPP platform.
                      </p>
                      <br />
                      <p>
                        With the data supplied at project import stage, some limitations will still
                        apply (for  example, default lock status from protected areas, until a
                        protected area shapefile is uploaded in a cloned scenario) but the imported
                        legacy project will largely be functional like a native Marxan MaPP project.
                      </p>
                    </div>
                  </InfoButton>
                </div>

                <div className="space-y-5">
                  {LEGACY_FIELDS.map((f) => {
                    return (
                      <>
                        {!successFile && (
                          <FieldRFF name="file">
                            {(props) => (
                              <div className="space-y-2.5">
                                <Label theme="light" className="uppercase" id="file">
                                  {f.label}
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
                      </>
                    );
                  })}

                </div>

                <div className="mt-7">
                  <FieldRFF
                    name="solutionsAreLocked"
                    type="checkbox"
                  >
                    {(fprops) => (
                      <Field className="flex mt-2" id="solutionsAreLocked" {...fprops}>
                        <Checkbox theme="light" />
                        <Label theme="light" className="ml-2 -mt-1 font-sans text-xs">
                          Do you want to lock these results calculated outside of the
                          Marxan MaPP platform?
                        </Label>

                      </Field>
                    )}
                  </FieldRFF>
                </div>

                <div className="flex justify-center mt-16 space-x-6">
                  <Button
                    theme="secondary"
                    size="xl"
                    onClick={() => {
                      setStep(1);
                      onCancelImportLegacyProject();
                    }}
                  >
                    Back
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

              <Loading
                visible={loading}
                className="absolute top-0 left-0 z-40 flex items-center justify-center w-full h-full bg-white bg-opacity-90"
                iconClassName="w-10 h-10 text-primary-500"
              />
            </form>
          );
        }}
      />

    </div>
  );
};

export default UploadFilesStep;
