import React, { useCallback, useRef } from 'react';

import { Form as FormRFF, Field as FieldRFF, FormProps } from 'react-final-form';
import { useQueryClient } from 'react-query';

import { useRouter } from 'next/router';

import { useToasts } from 'hooks/toast';
import { useEditWDPA, useProjectWDPAs } from 'hooks/wdpa';

import Button from 'components/button';
import Field from 'components/forms/field';
import Label from 'components/forms/label';
import { composeValidators } from 'components/forms/validations';
import { WDPA } from 'types/api/wdpa';

export type FormValues = { fullName: WDPA['fullName'] };

const EditModal = ({
  wdpaId,
  handleModal,
}: {
  wdpaId: WDPA['id'];
  handleModal: (modalKey: 'delete' | 'edit', isVisible: boolean) => void;
}): JSX.Element => {
  const queryClient = useQueryClient();
  const { addToast } = useToasts();
  const { query } = useRouter();
  const { pid } = query as { pid: string };

  const formRef = useRef<FormProps<FormValues>['form']>(null);

  const allProjectWDPAsQuery = useProjectWDPAs(pid, {});
  const editWDPAMutation = useEditWDPA({});

  const onEditSubmit = useCallback(
    (values: FormValues) => {
      const { fullName } = values;
      editWDPAMutation.mutate(
        {
          wdpaId: wdpaId,
          data: {
            name: fullName,
          },
        },
        {
          onSuccess: async () => {
            await queryClient.invalidateQueries(['wdpas', pid]);
            handleModal('edit', false);
            addToast(
              'success-edit-wdpa',
              <>
                <h2 className="font-medium">Success!</h2>
                <p className="text-sm">Protected area edited</p>
              </>,
              {
                level: 'success',
              }
            );
          },
          onError: () => {
            addToast(
              'error-edit-wdpa',
              <>
                <h2 className="font-medium">Error!</h2>
                <p className="text-sm">It is not possible to edit this protected area</p>
              </>,
              {
                level: 'error',
              }
            );
          },
        }
      );
    },
    [addToast, editWDPAMutation, wdpaId, handleModal, pid, queryClient]
  );

  return (
    <FormRFF<FormValues>
      initialValues={{
        fullName: allProjectWDPAsQuery.data?.[0]?.fullName,
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
                <FieldRFF<string>
                  name="fullName"
                  validate={composeValidators([{ presence: true }])}
                >
                  {(fprops) => (
                    <Field id="fullName" {...fprops}>
                      <Label theme="light" className="mb-3 text-xs font-semibold uppercase">
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

export default EditModal;
