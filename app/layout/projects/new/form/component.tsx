import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import { useDispatch } from 'react-redux';

import Link from 'next/link';
import { useRouter } from 'next/router';

import {
  setBbox,
  setMaxPuAreaSize,
  setMinPuAreaSize,
  setUploadingPlanningArea,
  setUploadingPlanningAreaId,
  setUploadingGridId,
} from 'store/slices/projects/new';

import { usePlausible } from 'next-plausible';

import { useMe } from 'hooks/me';
import { useOrganizations } from 'hooks/organizations';
import { useSaveProject } from 'hooks/projects';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import Field from 'components/forms/field';
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import Select from 'components/forms/select';
import Textarea from 'components/forms/textarea';
import { composeValidators } from 'components/forms/validations';
import InfoButton from 'components/info-button';
import { ScrollArea } from 'components/scroll-area';
import HelpBeacon from 'layout/help/beacon';
import CountryRegionSelector from 'layout/projects/new/form/country-region-selector';
import PlanningAreaGridUploader from 'layout/projects/new/form/planning-area-grid-uploader';
import PlanningAreaSelector from 'layout/projects/new/form/planning-area-selector';
import PlanningAreaUploader from 'layout/projects/new/form/planning-area-uploader';

import REGION_PU from 'images/info-buttons/img_planning_region_grid.png';

import { DEFAULT_AREA, PA_OPTIONS } from './constants';

export type NewProjectFields = {
  PAOptionSelected: string;
  countryId: string;
  planningAreaGridId: string;
  planningUnitAreakm2: number;
  planningUnitGridShape: string;
  planningAreaId: string;
  adminAreaLevel1Id: string;
  adminAreaLevel2Id: string;
};

export interface ProjectFormProps {
  onFormUpdate: (formValues: NewProjectFields) => void;
}

const ProjectForm = ({ onFormUpdate }: ProjectFormProps): JSX.Element => {
  const { addToast } = useToasts();
  const { push } = useRouter();
  const plausible = usePlausible();
  const [PAOptionSelected, setPAOptionSelected] = useState('');
  const planningAreaScrollRef = useRef(null);
  const { user } = useMe();
  const { data: organizationsData } = useOrganizations();
  const dispatch = useDispatch();
  const saveProjectMutation = useSaveProject({});

  useEffect(() => {
    return () => {
      dispatch(setBbox(null));
      dispatch(setMinPuAreaSize(null));
      dispatch(setMaxPuAreaSize(null));
      dispatch(setUploadingPlanningArea(null));
      dispatch(setUploadingGridId(null));
    };
  }, [dispatch]);

  const onSubmit = (values: NewProjectFields) => {
    const v = { ...values };
    const { planningAreaGridId } = v;
    delete v.PAOptionSelected;
    delete v.planningAreaGridId;

    // TEMPORARY!!
    // This should be removed once organizations IDs are handled in the user
    const data = {
      ...v,
      ...(planningAreaGridId && { planningAreaId: planningAreaGridId }),
      ...(planningAreaGridId && { planningUnitGridShape: 'from_shapefile' }),
      organizationId: organizationsData[0].id || '7f1fb7f8-1246-4509-89b9-f48b6f976e3f',
    } satisfies NewProjectFields & { organizationId: string };

    saveProjectMutation.mutate(
      { data },
      {
        onSuccess: ({ data: { data: p } }) => {
          addToast(
            'success-project-creation',
            <>
              <h2 className="font-medium">Success!</h2>
              <p className="text-sm">Project saved successfully</p>
            </>,
            {
              level: 'success',
            }
          );

          console.info('Project saved succesfully', p);
          push('/projects');
          plausible('New project', {
            props: {
              userId: `${user.id}`,
              userEmail: `${user.email}`,
            },
          });
          if (data.planningUnitGridShape === 'from_shapefile') {
            plausible('Create project with planing unit shapefile', {
              props: {
                userId: `${user.id}`,
                userEmail: `${user.email}`,
              },
            });
          }
          if (!data.countryId && data.planningUnitGridShape !== 'from_shapefile') {
            plausible('Create project with planing region shapefile', {
              props: {
                userId: `${user.id}`,
                userEmail: `${user.email}`,
              },
            });
          }
          if (data.countryId) {
            plausible('Create project without shapefile', {
              props: {
                userId: `${user.id}`,
                userEmail: `${user.email}`,
              },
            });
          }
        },
        onError: () => {
          addToast(
            'error-project-creation',
            <>
              <h2 className="font-medium">Error!</h2>
              <p className="text-sm">Project could not be created</p>
            </>,
            {
              level: 'error',
            }
          );

          console.error('Project could not be created');
        },
      }
    );
  };

  const scrollDown = useCallback((ref) => {
    ref?.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, []);

  const resetPlanningArea = (form) => {
    dispatch(setUploadingPlanningArea(null));
    dispatch(setUploadingPlanningAreaId(null));
    dispatch(setBbox(null));

    const registeredFields = form.getRegisteredFields();
    registeredFields.forEach((f) => {
      const omitFields = ['name', 'description', 'planningUnitGridShape', 'PAOptionSelected'];
      if (!omitFields.includes(f)) {
        form.change(f, null);
      }
    });
  };

  const resetPlanningAreaGrid = (form) => {
    dispatch(setUploadingGridId(null));
    dispatch(setBbox(null));

    const registeredFields = form.getRegisteredFields();
    registeredFields.forEach((f) => {
      const omitFields = ['name', 'description', 'PAOptionSelected'];
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
    <FormRFF<NewProjectFields>
      onSubmit={onSubmit}
      initialValues={{
        ...DEFAULT_AREA,
      }}
    >
      {({ form, handleSubmit, values }) => {
        onFormUpdate(values);

        return (
          <form
            onSubmit={handleSubmit}
            autoComplete="off"
            className="flex h-full w-full flex-col justify-between overflow-hidden"
          >
            <div className="h-full overflow-hidden">
              <HelpBeacon
                id="project-new-overview"
                title="Basic information"
                subtitle="New project overview"
                content={
                  <div className="space-y-2">
                    <p>
                      To create a new project you need to add a name, a description, a planning
                      region and a planning grid.
                    </p>
                    <p>
                      You will be able to create a planning region and grid from scratch following
                      some simple steps or you can upload your own file.
                    </p>
                  </div>
                }
                modifiers={['flip']}
                tooltipPlacement="right"
              >
                <div className="flex h-full flex-col overflow-hidden">
                  <ScrollArea className="relative before:pointer-events-none before:absolute before:left-0 before:top-0 before:z-10 before:h-6 before:w-full before:bg-gradient-to-b before:from-black before:via-black after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:z-10 after:h-6 after:w-full after:bg-gradient-to-t after:from-black after:via-black">
                    <div className="w-[calc(100%-25px)] py-5 pr-3">
                      <h1 className="max-w-xs font-heading text-2xl text-white">
                        Name your project and define a planning area:
                      </h1>

                      {/* NAME */}
                      <div className="mt-8">
                        <FieldRFF name="name" validate={composeValidators([{ presence: true }])}>
                          {(fprops) => (
                            <Field id="name" {...fprops}>
                              <div className="mb-3 flex items-center space-x-2">
                                <Label theme="dark" className="uppercase" id="name">
                                  Project Name
                                </Label>

                                <InfoButton>
                                  <span>
                                    <h4 className="mb-2.5 font-heading text-lg">Project Name</h4>
                                    <div className="space-y-2">
                                      <p>
                                        One project can aggregate multiple scenarios with the same
                                        planning region and grid. Therefore, using a generic name
                                        for the project is recommended (eg: the name of the planning
                                        region) as well as a generic overview for the description.
                                      </p>
                                      <p>
                                        In each Scenario you will be able to provide more specific
                                        details.
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
                              <Label theme="dark" className="mb-3 uppercase">
                                Description
                              </Label>
                              <Textarea rows={4} placeholder="Write your project description..." />
                            </Field>
                          )}
                        </FieldRFF>
                      </div>

                      {/* PLANNING AREA */}
                      <div className="mt-10 flex flex-col justify-between">
                        <div className="mb-5 flex items-center space-x-3">
                          <h2 className="font-heading text-lg font-medium">
                            Do you have a planning region or planning unit shapefile?
                          </h2>
                          <InfoButton>
                            <span>
                              <h4 className="mb-2.5 font-heading text-lg">Planning Area</h4>
                              <div className="space-y-2">
                                <p>
                                  The planning area (also named planning region, study region or
                                  study area) is the outer boundary of the region where you want to
                                  create a plan.
                                </p>
                                <p>
                                  These regions often represent administrative units (such as
                                  countries or smaller regions), but you can also upload your own
                                  geometry.
                                </p>
                                <p>
                                  The planning region is converted to a grid of planning units, that
                                  are the central pieces that Marxan uses in its analyses.
                                </p>
                                <img src={REGION_PU} alt="Region-PU" />
                              </div>
                            </span>
                          </InfoButton>
                        </div>

                        {/* PLANNING AREA TYPE SELECTOR */}
                        <FieldRFF name="PAOptionSelected">
                          {(fprops) => (
                            <div className="px-[1px]">
                              <Field id="PAOptionSelected" {...fprops}>
                                <Select
                                  theme="dark"
                                  size="base"
                                  status="none"
                                  placeholder="Select option..."
                                  initialSelected={PAOptionSelected}
                                  options={OPTIONS}
                                  onChange={(value: string) => {
                                    form.change('PAOptionSelected', value);
                                    setPAOptionSelected(value);
                                    resetPlanningArea(form);
                                    resetPlanningAreaGrid(form);
                                  }}
                                />
                              </Field>
                            </div>
                          )}
                        </FieldRFF>
                      </div>

                      {PAOptionSelected === 'regular' && (
                        <div className="px-[1px]">
                          <CountryRegionSelector
                            country={values.countryId}
                            region={values.adminAreaLevel1Id}
                            subRegion={values.adminAreaLevel2Id}
                            onClick={() => scrollDown(planningAreaScrollRef)}
                          />
                          {(!!values.countryId || !!values.planningAreaId) && (
                            <PlanningAreaSelector values={values} />
                          )}
                          <div ref={planningAreaScrollRef} />
                        </div>
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
                          {values.planningAreaId && <PlanningAreaSelector values={values} />}
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
                  </ScrollArea>

                  {/* BUTTON BAR */}
                  <div className="mt-4 flex px-8 pb-8">
                    <Link href="/projects" passHref>
                      <Button theme="secondary" size="xl">
                        Cancel
                      </Button>
                    </Link>
                    <Button className="ml-6" theme="primary" size="xl" type="submit">
                      Save
                    </Button>
                  </div>
                </div>
              </HelpBeacon>
            </div>
          </form>
        );
      }}
    </FormRFF>
  );
};

export default ProjectForm;
