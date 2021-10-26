import React, { useState, useEffect, useMemo } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import { useDispatch } from 'react-redux';

import Link from 'next/link';
import { useRouter } from 'next/router';

import {
  setBbox, setMaxPuAreaSize, setMinPuAreaSize, setUploadingPlanningArea,
} from 'store/slices/projects/new';

import { usePlausible } from 'next-plausible';

import { useMe } from 'hooks/me';
import { useOrganizations } from 'hooks/organizations';
import { useSaveProject } from 'hooks/projects';
import { useToasts } from 'hooks/toast';

import HelpBeacon from 'layout/help/beacon';
import CountryRegionSelector from 'layout/projects/new/form/country-region-selector';
import PlanningAreaGridUploader from 'layout/projects/new/form/planning-area-grid-uploader';
import PlanningAreaSelector from 'layout/projects/new/form/planning-area-selector';
import PlanningAreaUploader from 'layout/projects/new/form/planning-area-uploader';
import ProjectNewMap from 'layout/projects/new/map';

import Button from 'components/button';
import Field from 'components/forms/field';
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import Select from 'components/forms/select';
import Textarea from 'components/forms/textarea';
import {
  composeValidators,
} from 'components/forms/validations';
import InfoButton from 'components/info-button';

import REGION_PU from 'images/info-buttons/img_planning_region_grid.png';

import { DEFAULT_AREA, PA_OPTIONS } from './constants';
import ProjectFormProps from './types';

const ProjectForm: React.FC<ProjectFormProps> = () => {
  const { addToast } = useToasts();
  const { push } = useRouter();
  const plausible = usePlausible();

  const [PAOptionSelected, setPAOptionSelected] = useState('');

  const { user } = useMe();

  const { data: organizationsData } = useOrganizations();

  const dispatch = useDispatch();

  // Project mutation and submit
  const saveProjectMutation = useSaveProject({});

  useEffect(() => {
    return () => {
      dispatch(setBbox(null));
      dispatch(setMinPuAreaSize(null));
      dispatch(setMaxPuAreaSize(null));
      dispatch(setUploadingPlanningArea(null));
    };
  }, [dispatch]);

  const onSubmit = (values) => {
    const { planningAreaGridId } = values;
    delete values.PAOptionSelected;
    delete values.planningAreaGridId;

    // TEMPORARY!!
    // This should be removed once organizations IDs are handled in the user
    const data = {
      ...values,
      ...(planningAreaGridId && { planningAreaId: planningAreaGridId }),
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
        plausible('New project', {
          props: {
            userId: `${user.id}`,
            userEmail: `${user.email}`,
          },
        });
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

  const resetPlanningArea = (form) => {
    dispatch(setUploadingPlanningArea(null));
    dispatch(setBbox(null));

    const registeredFields = form.getRegisteredFields();
    registeredFields.forEach((f) => {
      const omitFields = ['name', 'description', 'planningUnitGridShape'];
      if (!omitFields.includes(f)) {
        form.change(f, null);
      }
    });
  };

  const resetPlanningAreaGrid = (form) => {
    dispatch(setUploadingPlanningArea(null));
    dispatch(setBbox(null));

    const registeredFields = form.getRegisteredFields();
    registeredFields.forEach((f) => {
      const omitFields = ['name', 'description'];
      if (!omitFields.includes(f)) {
        form.change(f, null);
      }
    });
  };

  // Constants
  const OPTIONS = useMemo(() => {
    return PA_OPTIONS.filter((o) => o.value !== PAOptionSelected);
  }, [PAOptionSelected]);

  return (
    <FormRFF
      onSubmit={onSubmit}
      initialValues={{
        ...DEFAULT_AREA,
      }}
    >
      {({ form, handleSubmit, values }) => (
        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="flex flex-col justify-between flex-grow w-full overflow-hidden"
        >
          <div className="grid h-full grid-cols-1 gap-0 overflow-hidden bg-gray-700 md:grid-cols-2 rounded-3xl">
            <HelpBeacon
              id="project-new-overview"
              title="Basic information"
              subtitle="New project overview"
              content={(
                <div className="space-y-2">
                  <p>
                    To create a new project you need to add a name,
                    a description, a planning region and
                    a planning grid.
                  </p>
                  <p>
                    You will be able to create a
                    planning region and grid
                    from scratch following some
                    simple steps or you can upload
                    your own file.
                  </p>
                </div>
              )}
              modifiers={['flip']}
              tooltipPlacement="right"
            >
              <div id="project-new-form" className="flex flex-col flex-grow overflow-hidden">
                <div className="relative flex flex-col flex-grow min-h-0">
                  <div className="absolute top-0 left-0 z-10 w-full h-6 pointer-events-none bg-gradient-to-b from-gray-700 via-gray-700" />

                  <div className="flex flex-col flex-grow p-8 overflow-auto">
                    <h1 className="max-w-xs text-2xl text-white font-heading">
                      Name your project and define a planning area:
                    </h1>

                    {/* NAME */}
                    <div className="mt-8">
                      <FieldRFF
                        name="name"
                        validate={composeValidators([{ presence: true }])}
                      >
                        {(fprops) => (
                          <Field id="name" {...fprops}>
                            <div className="flex items-center mb-3 space-x-2">
                              <Label theme="dark" className="uppercase" id="name">
                                Project Name
                              </Label>

                              <InfoButton>
                                <span>
                                  <h4 className="font-heading text-lg mb-2.5">Project Name</h4>
                                  <div className="space-y-2">
                                    <p>
                                      One project can aggregate multiple scenarios
                                      with the same planning region and grid.
                                      Therefore, using a generic name for the project is
                                      recommended (eg: the name of the planning region)
                                      as well as a generic overview for the description.
                                    </p>
                                    <p>
                                      In each Scenario you will be able
                                      to provide more specific details.
                                    </p>
                                  </div>
                                </span>
                              </InfoButton>
                            </div>
                            <Input theme="dark" type="text" placeholder="Write project name..." />
                          </Field>
                        )}
                      </FieldRFF>
                    </div>

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
                    <div className="flex flex-col justify-between mt-6">
                      <div className="flex items-center mb-5 space-x-3">
                        <h2 className="text-lg font-medium font-heading">Do you have a planning region or grid shapefile?</h2>
                        <InfoButton>
                          <span>
                            <h4 className="font-heading text-lg mb-2.5">Planning Area</h4>
                            <div className="space-y-2">
                              <p>
                                The planning area (also named planning
                                region, study region
                                or study area) is
                                the outer boundary
                                of the region where you want to create a
                                plan.
                              </p>
                              <p>
                                These regions
                                often represent administrative units
                                (such as countries or
                                smaller regions), but you can also upload your
                                own geometry.
                              </p>
                              <p>
                                The planning region is converted to a
                                grid of planning units, that are the
                                central pieces that Marxan uses in its analyses.
                              </p>
                              <img src={REGION_PU} alt="Region-PU" />
                            </div>
                          </span>
                        </InfoButton>
                      </div>

                      {/* PLANNING AREA TYPE SELECTOR */}
                      <FieldRFF
                        name="PAOptionSelected"
                      >
                        {(fprops) => (
                          <Field id="PAOptionSelected" {...fprops}>
                            <Select
                              theme="dark"
                              size="base"
                              status="none"
                              placeholder="Select option..."
                              initialSelected={PAOptionSelected}
                              options={OPTIONS}
                              onChange={(value: string) => {
                                setPAOptionSelected(value);
                                resetPlanningArea(form);
                              }}
                            />
                          </Field>
                        )}
                      </FieldRFF>
                    </div>

                    {PAOptionSelected === 'regular' && (
                      <>
                        <CountryRegionSelector
                          country={values.countryId}
                          region={values.adminAreaLevel1Id}
                          subRegion={values.adminAreaLevel2Id}
                        />
                        <PlanningAreaSelector
                          values={values}
                        />
                      </>
                    )}

                    {/* CUSTOM SHAPEFILE PLANNING AREA */}
                    {PAOptionSelected === 'customPAshapefile' && (
                      <div className="mt-3">
                        <FieldRFF
                          name="planningAreaId"
                          validate={composeValidators([{ presence: true }])}
                        >
                          {(fprops) => {
                            return (
                              <PlanningAreaUploader
                                {...fprops}
                                resetPlanningArea={resetPlanningArea}
                                form={form}
                              />
                            );
                          }}
                        </FieldRFF>
                        <PlanningAreaSelector
                          values={values}
                        />
                      </div>
                    )}

                    {/* CUSTOM GRID SHAPEFILE PLANNING AREA */}
                    {PAOptionSelected === 'customPAshapefileGrid' && (
                      <div className="mt-3">
                        <FieldRFF
                          name="planningAreaGridId"
                          validate={composeValidators([{ presence: true }])}
                        >
                          {(fprops) => {
                            return (
                              <PlanningAreaGridUploader
                                {...fprops}
                                resetPlanningAreaGrid={resetPlanningAreaGrid}
                                form={form}
                              />
                            );
                          }}
                        </FieldRFF>
                      </div>
                    )}
                  </div>
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
            </HelpBeacon>

            <HelpBeacon
              id="project-new-map"
              title="MAP VIEW"
              subtitle="New planning area and grid"
              content={(
                <div className="space-y-2">
                  <p>
                    On the map you will be able to see your selected
                    or uploaded planning area and grid.
                  </p>
                  <p>
                    If you are creating a new grid,
                    you can change the shape and
                    size of the planning units
                    and look at the different results
                    here to find
                    the best combination for
                    your conservation plan.
                  </p>

                </div>
              )}
              modifiers={['flip']}
              tooltipPlacement="right"
            >
              <div className="w-full h-full">
                <ProjectNewMap
                  country={values.countryId}
                  region={values.adminAreaLevel1Id}
                  subregion={values.adminAreaLevel2Id}
                  planningUnitGridShape={values.planningUnitGridShape}
                  planningUnitAreakm2={values.planningUnitAreakm2}
                />
              </div>
            </HelpBeacon>
          </div>
        </form>
      )}
    </FormRFF>
  );
};

export default ProjectForm;
