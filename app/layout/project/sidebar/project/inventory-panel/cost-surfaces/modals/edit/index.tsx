import React, {
  ElementRef,
  useCallback,
  useRef,
  InputHTMLAttributes,
  useState,
  useEffect,
} from 'react';

import { Form as FormRFF, Field as FieldRFF, FormProps } from 'react-final-form';
import { useQueryClient } from 'react-query';

import { useRouter } from 'next/router';

import {
  useEditFeatureTag,
  useEditFeature,
  useProjectFeatures,
  useDeleteFeatureTag,
} from 'hooks/features';
import { useProjectTags } from 'hooks/projects';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import Field from 'components/forms/field';
import Label from 'components/forms/label';
import { composeValidators } from 'components/forms/validations';
import Icon from 'components/icon/component';
import { Feature } from 'types/api/feature';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

export type FormValues = { featureClassName: Feature['featureClassName']; tag: Feature['tag'] };

const EditModal = ({
  featureId,
  handleModal,
}: {
  featureId: Feature['id'];
  handleModal: (modalKey: 'delete' | 'edit', isVisible: boolean) => void;
}): JSX.Element => {
  const queryClient = useQueryClient();
  const { addToast } = useToasts();
  const { query } = useRouter();
  const { pid } = query as { pid: string };

  const formRef = useRef<FormProps<FormValues>['form']>(null);

  const featureQuery = useProjectFeatures(pid, featureId);
  const editFeatureTagMutation = useEditFeatureTag();
  const deleteFeatureTagMutation = useDeleteFeatureTag();
  const editFeatureMutation = useEditFeature();

  const onEditSubmit = useCallback(
    (values: FormValues) => {
      const { featureClassName, tag } = values;
      const editFeaturePromise = editFeatureMutation.mutateAsync({
        fid: featureId,
        body: {
          featureClassName,
        },
      });

      const editFeatureTagPromise = () => {
        if (values.tag) {
          return editFeatureTagMutation.mutateAsync({
            projectId: pid,
            featureId,
            data: {
              tagName: tag,
            },
          });
        } else {
          return deleteFeatureTagMutation.mutateAsync({
            projectId: pid,
            featureId,
          });
        }
      };

      Promise.all([editFeaturePromise, editFeatureTagPromise()])
        .then(async () => {
          await queryClient.invalidateQueries(['all-features', pid]);
          handleModal('edit', false);

          addToast(
            'success-edit-feature',
            <>
              <h2 className="font-medium">Success!</h2>
              <p className="text-sm">Features edited</p>
            </>,
            {
              level: 'success',
            }
          );
        })
        .catch(() => {
          addToast(
            'error-edit-feature',
            <>
              <h2 className="font-medium">Error!</h2>
              <p className="text-sm">It is not possible to edit this feature</p>
            </>,
            {
              level: 'error',
            }
          );
        });
    },
    [
      addToast,
      deleteFeatureTagMutation,
      editFeatureTagMutation,
      editFeatureMutation,
      featureId,
      handleModal,
      pid,
      queryClient,
    ]
  );

  return (
    <FormRFF<FormValues>
      initialValues={{
        featureClassName: featureQuery.data?.[0]?.featureClassName,
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
                <FieldRFF<string>
                  name="featureClassName"
                  validate={composeValidators([{ presence: true }])}
                >
                  {(fprops) => (
                    <Field id="featureClassName" {...fprops}>
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
