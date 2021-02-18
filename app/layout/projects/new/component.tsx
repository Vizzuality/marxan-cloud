import React from 'react';
// import cx from 'classnames';
import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';

import Field from 'components/forms/field';
import Label from 'components/forms/label';
import Input from 'components/forms/input';
import Textarea from 'components/forms/textarea';

import {
  composeValidators,
} from 'components/forms/validations';

import Wrapper from 'layout/wrapper';

import { NewProjectProps } from './types';

export const NewProject: React.FC<NewProjectProps> = () => {
  const handleSubmit = (values) => {
    console.log('values', values);
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
                <h2 className="max-w-xs text-white font-heading">
                  Name your project and define a planning area:
                </h2>

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
