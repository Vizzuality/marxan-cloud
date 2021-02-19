import React from 'react';
// import cx from 'classnames';
import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';

import Field from 'components/forms/field';
import Label from 'components/forms/label';
import Input from 'components/forms/input';
import Textarea from 'components/forms/textarea';
import Button from 'components/button';

import {
  composeValidators,
} from 'components/forms/validations';

import Wrapper from 'layout/wrapper';

import PlanningUnitGrid from 'components/projects/planning-unit-grid';
import { NewProjectProps } from './types';

export const NewProject: React.FC<NewProjectProps> = () => {
  const handleSubmit = (values) => {
    console.info('values', values);
  };

  const handleCancel = () => {
    console.info('cancel');
  };

  return (
    <Wrapper>
      <div className="flex w-full h-full bg-gray-700 rounded-3xl">
        <div className="w-1/2 h-full">
          <FormRFF
            onSubmit={handleSubmit}
          >
            {(props) => (
              <form
                onSubmit={props.handleSubmit}
                autoComplete="off"
                className="justify-start w-full p-8"
              >
                <h1 className="max-w-xs text-white font-heading">
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

                <h2 className="mt-12 text-white font-heading">
                  Do you have a planning region shapefile?
                </h2>

                <PlanningUnitGrid unit={null} />

                {/* BUTTON BAR */}
                <div className="flex mt-8">
                  <Button
                    theme="secondary"
                    size="xl"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="ml-6"
                    theme="primary"
                    size="xl"
                    type="submit"
                    disabled
                  >
                    Save
                  </Button>
                </div>
              </form>
            )}
          </FormRFF>
        </div>
        <div className="flex items-center justify-center w-1/2 h-full text-white">
          This will be the map
        </div>
      </div>
    </Wrapper>
  );
};

export default NewProject;
