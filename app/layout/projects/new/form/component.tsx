import React, { useState, useEffect } from 'react';
import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import Link from 'next/link';

import ProjectNewMap from 'layout/projects/new/map';

import Icon from 'components/icon';
import Field from 'components/forms/field';
import Label from 'components/forms/label';
import Input from 'components/forms/input';
import Textarea from 'components/forms/textarea';
import Button from 'components/button';
import InfoButton from 'components/info-button';

import UPLOAD_SHAPEFILE_SVG from 'svgs/ui/upload.svg?sprite';

import {
  composeValidators,
} from 'components/forms/validations';

import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { useOrganizations } from 'hooks/organizations';
import { useSaveProject } from 'hooks/projects';
import { useToasts } from 'hooks/toast';

import { setBbox, setMaxPuAreaSize, setMinPuAreaSize } from 'store/slices/projects/new';

import HelpBeacon from 'layout/help/beacon';
import PlanningAreaSelector from './planning-area-selector';
import ProjectFormProps from './types';
import { DEFAULT_AREA } from './constants';

const ProjectForm: React.FC<ProjectFormProps> = () => {
  const [hasPlanningArea, setHasPlanningArea] = useState(false);
  const { addToast } = useToasts();
  const { push } = useRouter();
  const { data: organizationsData } = useOrganizations();

  const dispatch = useDispatch();

  // Project mutation and submit
  const saveProjectMutation = useSaveProject({});

  useEffect(() => {
    return () => {
      dispatch(setBbox(null));
      dispatch(setMinPuAreaSize(null));
      dispatch(setMaxPuAreaSize(null));
    };
  }, [dispatch]);

  const onSubmit = (values) => {
    // TEMPORARY!!
    // This should be removed once organizations IDs are handled in the user
    const data = {
      ...values,
      organizationId: organizationsData[0].id || '7f1fb7f8-1246-4509-89b9-f48b6f976e3f',
    };

    saveProjectMutation.mutate({ data }, {
      onSuccess: ({ data: { data: p } }) => {
        addToast('success-project-creation', (
          <>
            <h2 className="font-medium">Success!</h2>
            <p className="text-sm">Project saved successfully</p>
          </>
        ), {
          level: 'success',
        });

        console.info('Project saved succesfully', p);
        push('/projects');
      },
      onError: () => {
        addToast('error-project-creation', (
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">Project could not be created</p>
          </>
        ), {
          level: 'error',
        });

        console.error('Project could not be created');
      },
    });
  };

  return (
    <FormRFF
      onSubmit={onSubmit}
      initialValues={{
        ...DEFAULT_AREA,
      }}
    >
      {({ handleSubmit, values }) => (
        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="flex flex-col justify-between flex-grow w-full overflow-hidden"
        >

          <div className="grid h-full grid-cols-1 gap-0 overflow-hidden bg-gray-700 md:grid-cols-2 rounded-3xl">
            <div id="project-new-form" className="flex flex-col flex-grow overflow-hidden">
              <div className="relative flex flex-col flex-grow min-h-0">
                <div className="absolute top-0 left-0 z-10 w-full h-6 pointer-events-none bg-gradient-to-b from-gray-700 via-gray-700" />
                <HelpBeacon
                  id="project-new-overview"
                  title="New project basic information"
                  subtitle=""
                  content={(
                    <div>
                      Start by adding a name, description and planning area
                      to your new project.

                    </div>
                  )}
                  modifiers={['flip']}
                  tooltipPlacement="left"
                >
                  <div className="flex flex-col flex-grow p-8 overflow-auto">
                    <h1 className="max-w-xs text-2xl text-white font-heading">
                      Name your project and define a planning area:
                    </h1>
                    <HelpBeacon
                      id="project-new-name_description"
                      title="New project name and description"
                      subtitle=""
                      content={(
                        <div>
                          A generic name for the project is
                          recommended (eg: the name of the planning region)
                          as well as a generic overview for the description.
                          In each Scenario you will be able
                          to provide specific details.

                        </div>
                  )}
                      modifiers={['flip', 'hide']}
                      tooltipPlacement="right"
                    >
                      {/* NAME */}

                      <div className="mt-8">
                        <FieldRFF
                          name="name"
                          validate={composeValidators([{ presence: true }])}
                        >
                          {(fprops) => (
                            <Field id="name" {...fprops}>
                              <Label theme="dark" className="mb-3 uppercase">Project Name</Label>
                              <Input theme="dark" type="text" placeholder="Write project name..." />
                            </Field>
                          )}
                        </FieldRFF>
                      </div>
                    </HelpBeacon>
                    {/* DESCRIPTION */}
                    <div className="mt-8">
                      <FieldRFF
                        name="description"
                        validate={composeValidators([{ presence: true }])}
                      >
                        {(fprops) => (
                          <Field id="description" {...fprops}>
                            <Label theme="dark" className="mb-3 uppercase">Description</Label>
                            <Textarea rows={4} placeholder="Write your project description..." />
                          </Field>
                        )}
                      </FieldRFF>
                    </div>

                    {/* PLANNING AREA */}
                    <HelpBeacon
                      id="project-new-planning-area"
                      title="New project planning area"
                      subtitle=""
                      content={(
                        <div>

                          Decide the outer boundary of
                          your planning area here.
                          The platform provides a workflow to select an
                          administrative
                          boundary as planning area
                          (eg: countries or municipalities)
                          but you can also upload your
                          own geometry.

                        </div>
                  )}
                      modifiers={['flip', 'hide']}
                      tooltipPlacement="right"
                    >
                      <div className="flex items-center justify-between mt-6">

                        <div className="flex items-center">

                          <Label theme="dark" className="mr-2 uppercase text-xxs">Planning area</Label>
                          <InfoButton>
                            <span>
                              The planning area (or study region) is
                              the outer boundary
                              of the region where you want to create a
                              plan. These regions
                              often represent administrative units
                              (such as countries or
                              smaller regions), but can represent any
                              planning area.
                            </span>
                          </InfoButton>
                        </div>
                        {/* TEMPORARILY HIDDEN, it will be implemented in the future */}
                        <div className="hidden">
                          <Button
                            className="w-20 h-6 mr-4"
                            size="xs"
                            theme={!hasPlanningArea ? 'white' : 'secondary'}
                            onClick={() => setHasPlanningArea(false)}
                          >
                            No
                          </Button>
                          <Button
                            className="w-20 h-6"
                            size="xs"
                            theme={hasPlanningArea ? 'white' : 'secondary'}
                            onClick={() => setHasPlanningArea(true)}
                          >
                            Yes
                          </Button>

                        </div>

                      </div>
                    </HelpBeacon>

                    {!hasPlanningArea && (
                      <PlanningAreaSelector
                        values={values}
                      />
                    )}

                    {hasPlanningArea && (
                      <Button
                        className="flex w-full mt-4"
                        theme="secondary"
                        size="base"
                        onClick={() => console.info('Upload shapefile')}
                      >
                        <span className="w-full">
                          Upload shapefile
                        </span>
                        <Icon
                          icon={UPLOAD_SHAPEFILE_SVG}
                        />
                      </Button>
                    )}
                  </div>
                </HelpBeacon>
                <div className="absolute bottom-0 left-0 z-10 w-full h-6 pointer-events-none bg-gradient-to-t from-gray-700 via-gray-700" />

              </div>

              {/* BUTTON BAR */}
              <div className="flex px-8 pb-8 mt-4">
                <Link href="/projects" passHref>
                  <a
                    href="/projects"
                  >
                    <Button
                      theme="secondary"
                      size="xl"
                    >
                      Cancel
                    </Button>
                  </a>
                </Link>
                <Button
                  className="ml-6"
                  theme="primary"
                  size="xl"
                  type="submit"
                >
                  Save
                </Button>
              </div>
            </div>

            <ProjectNewMap
              country={values.countryId}
              region={values.adminAreaLevel1Id}
              subregion={values.adminAreaLevel2Id}
              planningUnitGridShape={values.planningUnitGridShape}
              planningUnitAreakm2={values.planningUnitAreakm2}

            />

          </div>

        </form>
      )}
    </FormRFF>
  );
};

export default ProjectForm;
