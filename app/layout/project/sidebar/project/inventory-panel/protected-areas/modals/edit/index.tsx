import React, { useCallback, useRef } from 'react';

import { Form as FormRFF, Field as FieldRFF, FormProps } from 'react-final-form';

import { useRouter } from 'next/router';

import Button from 'components/button';
import Field from 'components/forms/field';
import Label from 'components/forms/label';
import { composeValidators } from 'components/forms/validations';
import { Feature } from 'types/feature';

export type FormValues = { name: 'string' };

const EditProtectedAreaModal = ({
  featureId,
  handleModal,
}: {
  featureId: Feature['id'];
  handleModal: (modalKey: 'delete' | 'edit', isVisible: boolean) => void;
}): JSX.Element => {
  const { query } = useRouter();
  const { pid } = query as { pid: string };

  const formRef = useRef<FormProps<FormValues>['form']>(null);

  const onEditSubmit = useCallback(
    (values: FormValues) => {
      const { name } = values;
      console.log('new protected area name', name, pid);
    },
    [pid]
  );

  return (
    <FormRFF<FormValues>
      initialValues={{
        name: null,
      }}
      ref={formRef}
      onSubmit={onEditSubmit}
      render={({ form, handleSubmit }) => {
        formRef.current = form;

        return (
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex flex-col space-y-5 px-8 py-1">
              <h2 className="font-heading font-bold text-black">Edit protected area</h2>

              <div>
                <FieldRFF<string> name="name" validate={composeValidators([{ presence: true }])}>
                  {(fprops) => (
                    <Field id="name" {...fprops}>
                      <Label theme="light" className="mb-3 uppercase">
                        Name
                      </Label>

                      <input
                        {...fprops.input}
                        className="h-10 w-full rounded-md border border-gray-300 px-3 text-gray-800 focus:border-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Type name..."
                        defaultValue={fprops.input.value}
                      />
                    </Field>
                  )}
                </FieldRFF>
              </div>

              <div className="mt-16 flex justify-center space-x-6">
                <Button theme="secondary" size="xl" onClick={() => handleModal('edit', false)}>
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
  );
};

export default EditProtectedAreaModal;
