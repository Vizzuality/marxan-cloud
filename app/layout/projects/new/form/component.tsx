import React, { useState } from 'react';
import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import Link from 'next/link';
import { useRouter } from 'next/router';

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

import { useSaveProject } from 'hooks/projects';
import { useToasts } from 'hooks/toast';

import PlanningAreaSelector from './planning-area-selector';
import ProjectFormProps from './types';
import { DEFAULT_AREA } from './constants';

const ProjectForm: React.FC<ProjectFormProps> = () => {
  const [hasPlanningArea, setHasPlanningArea] = useState(false);
  const { addToast } = useToasts();
  const { push } = useRouter();

  // Project mutation and submit
  const saveProjectMutation = useSaveProject({});

  const onSubmit = (values) => {
    // TEMPORARY!!
    // This should be removed once organizations IDs are handled in the app
    const data = {
      ...values,
      organizationId: '900acc1d-dbaa-4f5f-92ad-65bc9c46213f',
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
            <div className="flex flex-col flex-grow overflow-hidden">
              <div className="relative flex flex-col flex-grow min-h-0">
                <div className="absolute top-0 left-0 z-10 w-full h-6 bg-gradient-to-b from-gray-700 via-gray-700" />

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
                          <Label theme="dark" className="mb-3 uppercase">Project Name</Label>
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
                  <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center">
                      <Label theme="dark" className="mr-2 uppercase text-xxs">Planning area</Label>
                      <InfoButton>
                        <span>Planning area info button.</span>
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

                  {!hasPlanningArea && (
                  <PlanningAreaSelector
                    area={DEFAULT_AREA}
                    values={values}
                    onChange={(value) => console.info('Planning area change: ', value)}
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
                <div className="absolute bottom-0 left-0 z-10 w-full h-6 bg-gradient-to-t from-gray-700 via-gray-700" />
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
