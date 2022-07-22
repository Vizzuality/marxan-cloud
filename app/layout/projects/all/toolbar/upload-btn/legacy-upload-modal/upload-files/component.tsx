import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';

import { Field as FieldRFF, Form as FormRFF } from 'react-final-form';
import { useQueryClient } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';

import { setLegacyProjectId } from 'store/slices/projects/new';

import { useCancelImportLegacyProject, useLegacyProjectValidationResults, useImportLegacyProject } from 'hooks/projects';
import { useScenariosStatus } from 'hooks/scenarios';
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
  onDismiss: (notCancel?: boolean) => void;
  setStep: (step: number) => void;
}

export const UploadFiles: React.FC<UploadFilesProps> = ({
  onDismiss,
  setStep,
}: UploadFilesProps) => {
  const formRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [importLegacyErrors, setImportLegacyErrors] = useState(null);

  const { addToast } = useToasts();

  const dispatch = useDispatch();
  const { legacyProjectId } = useSelector((state) => state['/projects/new']);

  const queryClient = useQueryClient();

  const cancelLegacyProjectMutation = useCancelImportLegacyProject({});
  const legacyProjectValidationResultsMutation = useLegacyProjectValidationResults({});

  const importLegacyMutation = useImportLegacyProject({});

  const ref = useRef(null);

  const {
    data: scenarioStatusData,
    isError: scenarioStatusDataIsError,
  } = useScenariosStatus(legacyProjectId);
  const { jobs = [] } = scenarioStatusData || {};
  const legacyFailure = jobs.find((j) => j.kind === 'legacy')?.status === 'failure';
  const legacyDone = jobs.find((j) => j.kind === 'legacy')?.status === 'done';

  useEffect(() => {
    if (legacyDone) {
      queryClient.invalidateQueries('projects');
      queryClient.invalidateQueries(['scenarios', legacyProjectId]);
      onDismiss(true);
      setLoading(false);
      addToast('success-import-legacy-project', (
        <>
          <h2 className="font-medium">Success!</h2>
          <p className="text-sm">Legacy project import has been done</p>
        </>
      ), {
        level: 'success',
      });
    }
  }, [
    legacyProjectId,
    legacyDone,
    queryClient,
    addToast,
    onDismiss,
  ]);

  useEffect(() => {
    if (legacyFailure || scenarioStatusDataIsError) {
      legacyProjectValidationResultsMutation.mutate({ projectId: legacyProjectId }, {
        onSuccess: ({ errorsAndWarnings }) => {
          if (errorsAndWarnings && errorsAndWarnings.length) {
            const errors = errorsAndWarnings.filter((vr) => vr.status === 'failed').map((vr) => vr.errors);
            setLoading(false);
            setImportLegacyErrors(errors);
            ref?.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
          }
        },
        onError: ({ response }) => {
          const { errors } = response.data;
          console.info(errors);
          setLoading(false);
        },
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    legacyFailure,
    scenarioStatusDataIsError,
  ]);

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

  const onImportSubmit = useCallback((values) => {
    const solutionsAreLocked = !!values.solutionsAreLocked;
    const data = { solutionsAreLocked };

    setLoading(true);

    importLegacyMutation.mutate({ projectId: legacyProjectId, data }, {
      onSuccess: () => {
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
    legacyProjectId,
    addToast,
    importLegacyMutation,
  ]);

  return (
    <div className="mt-3 mb-5" ref={ref}>

      <FormRFF
        onSubmit={onImportSubmit}
        render={({ form, handleSubmit }) => {
          formRef.current = form;

          return (
            <form onSubmit={handleSubmit}>
              <div className="p-9">

                <div className="flex mb-2 space-x-2">
                  <h4 className="text-lg text-black font-heading">Upload legacy project</h4>
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
                <p className="mb-5 text-sm text-black">To import a legacy project, please, add the files requested below. </p>
                {importLegacyErrors && !!importLegacyErrors.length && (
                  <div className="flex flex-col mb-6 space-y-2">
                    {importLegacyErrors.map((e) => <p key={e} className="text-xs text-red-500">{e}</p>)}
                  </div>
                )}
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
                        <Label theme="light" className="ml-2 -mt-1 font-sans text-sm">
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
