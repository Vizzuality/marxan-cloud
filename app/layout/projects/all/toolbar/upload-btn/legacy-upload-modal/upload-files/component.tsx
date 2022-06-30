import React, { useCallback, useRef, useState } from 'react';

import { Field as FieldRFF, Form as FormRFF } from 'react-final-form';
import { useDispatch, useSelector } from 'react-redux';

import { setLegacyProjectId, setImportSubmit } from 'store/slices/projects/new';

import { useCancelImportLegacyProject, useImportLegacyProject } from 'hooks/projects';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import Checkbox from 'components/forms/checkbox';
import Field from 'components/forms/field';
import Label from 'components/forms/label';
import InfoButton from 'components/info-button';
import Loading from 'components/loading';

import { LEGACY_FIELDS } from './constants';
import UploadItem from './upload-item';

export interface UploadFilesProps {
  onDismiss: () => void;
  setStep: (step: number) => void;
}

export const UploadFiles: React.FC<UploadFilesProps> = ({
  onDismiss,
  setStep,
}: UploadFilesProps) => {
  const formRef = useRef(null);
  const [loading, setLoading] = useState(false);

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
        console.error('Import legacy project has not been canceled');
      },
    });
  }, [cancelLegacyProjectMutation, dispatch, legacyProjectId]);

  const importLegacyMutation = useImportLegacyProject({});

  const onImportSubmit = useCallback((values) => {
    dispatch(setImportSubmit(true));
    const solutionsAreLocked = !!values.solutionsAreLocked;
    const data = { solutionsAreLocked };
    console.info(data);
    setLoading(true);

    importLegacyMutation.mutate({ projectId: legacyProjectId }, {
      onSuccess: () => {
        setLoading(false);
        addToast('success-import-legacy-project', (
          <>
            <h2 className="font-medium">Success!</h2>
            <p className="text-sm">Legacy project has been imported</p>
          </>
        ), {
          level: 'success',
        });
        onDismiss();
        setStep(2);
        console.info('Legacy project uploaded');
      },
      onError: ({ response }) => {
        const { errors } = response.data;
        console.info(errors);

        setLoading(false);

        addToast('error-import-legacy-project', (
          <>
            <h2 className="font-medium">Error!</h2>
            <ul className="text-sm">
              <p className="text-sm">Legacy project has not been imported</p>
            </ul>
          </>
        ), {
          level: 'error',
        });
      },
    });
  }, [
    addToast,
    dispatch,
    importLegacyMutation,
    legacyProjectId,
    onDismiss,
    setStep,
  ]);

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
                      <UploadItem key={f.label} f={f} />
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

export default UploadFiles;
