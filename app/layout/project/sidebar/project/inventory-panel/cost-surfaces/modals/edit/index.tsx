import React, { useCallback, useRef } from 'react';

import { Form as FormRFF, Field as FieldRFF, FormProps } from 'react-final-form';
import { useQueryClient } from 'react-query';

import { useRouter } from 'next/router';

import { useEditProjectCostSurface, useProjectCostSurfaces } from 'hooks/cost-surface';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import Field from 'components/forms/field';
import Label from 'components/forms/label';
import { composeValidators } from 'components/forms/validations';
import { CostSurface } from 'types/api/cost-surface';

export type FormValues = { name: CostSurface['name'] };

const EditModal = ({
  costSurfaceId,
  handleModal,
}: {
  costSurfaceId: CostSurface['id'];
  handleModal: (modalKey: 'delete' | 'edit', isVisible: boolean) => void;
}): JSX.Element => {
  const queryClient = useQueryClient();
  const { addToast } = useToasts();
  const { query } = useRouter();
  const { pid } = query as { pid: string };

  const formRef = useRef<FormProps<FormValues>['form']>(null);

  const allProjectCostSurfacesQuery = useProjectCostSurfaces(pid, {});

  const editProjectCostSurfaceMutation = useEditProjectCostSurface();

  const onEditSubmit = useCallback(
    (values: FormValues) => {
      const { name } = values;

      editProjectCostSurfaceMutation.mutate(
        {
          costSurfaceId,
          projectId: pid,
          body: {
            name,
          },
        },
        {
          onSuccess: async () => {
            await queryClient.invalidateQueries(['cost-surfaces', pid]);
            handleModal('edit', false);
            addToast(
              'success-edit-cost-surfaces',
              <>
                <h2 className="font-medium">Success!</h2>
                <p className="text-sm">Cost surface edited</p>
              </>,
              {
                level: 'success',
              }
            );
          },
          onError: () => {
            addToast(
              'error-edit-cost-surfaces',
              <>
                <h2 className="font-medium">Error!</h2>
                <p className="text-sm">It is not possible to edit this cost surface</p>
              </>,
              {
                level: 'error',
              }
            );
          },
        }
      );
    },
    [addToast, costSurfaceId, editProjectCostSurfaceMutation, handleModal, pid, queryClient]
  );

  return (
    <FormRFF<FormValues>
      initialValues={{
        name: allProjectCostSurfacesQuery.data?.[0]?.name,
      }}
      ref={formRef}
      onSubmit={onEditSubmit}
      render={({ form, handleSubmit }) => {
        formRef.current = form;

        return (
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex flex-col space-y-5 px-8 py-1">
              <h2 className="font-heading font-bold text-black">Edit cost surface</h2>

              <div>
                <FieldRFF<string> name="name" validate={composeValidators([{ presence: true }])}>
                  {(fprops) => (
                    <Field id="name" {...fprops}>
                      <Label theme="light" className="mb-3 text-xs font-semibold uppercase">
                        Name
                      </Label>

                      <input
                        {...fprops.input}
                        className="h-10 w-full rounded-md border border-gray-400 px-3 text-gray-900 focus:border-none focus:outline-none focus:ring-1 focus:ring-blue-600"
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
