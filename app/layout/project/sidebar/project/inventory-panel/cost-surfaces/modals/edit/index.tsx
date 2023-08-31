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
  const tagsSectionRef = useRef<ElementRef<'div'>>(null);

  const [tagsMenuOpen, setTagsMenuOpen] = useState(false);
  const [tagIsDone, setTagIsDone] = useState(false);

  const tagsQuery = useProjectTags(pid);
  const featureQuery = useProjectFeatures(pid, featureId);
  const editFeatureTagMutation = useEditFeatureTag();
  const deleteFeatureTagMutation = useDeleteFeatureTag();
  const editFeatureMutation = useEditFeature();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tagsSectionRef.current && !tagsSectionRef.current.contains(event.target)) {
        setTagsMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, []);

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

  const handleKeyPress = useCallback(
    (event: Parameters<InputHTMLAttributes<HTMLInputElement>['onKeyDown']>[0]) => {
      if (event.key === 'Enter') {
        setTagIsDone(true);
        formRef.current.change('tag', event.currentTarget.value);
        setTagsMenuOpen(false);
      }
    },
    [formRef]
  );

  return (
    <FormRFF<FormValues>
      initialValues={{
        featureClassName: featureQuery.data?.[0]?.featureClassName,
        tag: featureQuery.data?.[0]?.tag,
      }}
      ref={formRef}
      onSubmit={onEditSubmit}
      render={({ form, handleSubmit, values }) => {
        formRef.current = form;

        return (
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex flex-col space-y-5 px-8 py-1">
              <h2 className="font-heading font-bold text-black">Edit feature</h2>

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

              <div ref={tagsSectionRef}>
                <FieldRFF<string> name="tag">
                  {(fprops) => (
                    <Field id="tag" {...fprops} className="relative">
                      <Label
                        theme="light"
                        className="mb-3 font-heading text-xs font-semibold uppercase"
                      >
                        Add type
                      </Label>
                      {(!values.tag || !tagIsDone) && (
                        <div className="space-y-2">
                          <input
                            {...fprops.input}
                            className="h-10 w-full rounded-md border border-gray-300 px-3 text-gray-800 focus:border-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Type to pick or create tag..."
                            value={fprops.input.value}
                            onFocus={() => {
                              setTagsMenuOpen(true);
                              form.change('tag', '');
                            }}
                            onBlur={() => setTagIsDone(true)}
                            onKeyDown={handleKeyPress}
                          />

                          {tagsMenuOpen && (
                            <div className="w-full space-y-2.5 rounded-md bg-white p-4 font-sans text-gray-800 shadow-md">
                              <div className="text-sm text-gray-800">Recent:</div>
                              <div className="flex flex-wrap gap-2.5">
                                {tagsQuery.data?.map((tag) => (
                                  <button
                                    key={tag}
                                    className="inline-block rounded-2xl border border-yellow-600 bg-yellow-400/50 px-3 py-0.5"
                                    onClick={() => {
                                      form.change('tag', tag);
                                      setTagIsDone(true);
                                    }}
                                  >
                                    <p className="text-sm text-gray-800">{tag}</p>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {values.tag && tagIsDone && (
                        <div className="flex items-center space-x-1">
                          <div className="inline-block items-center space-x-2 rounded-2xl border border-yellow-600 bg-yellow-400/50 px-3 py-0.5 hover:bg-yellow-600">
                            <p className="text-sm text-gray-800">{values.tag}</p>
                          </div>
                          <button
                            className="group flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-gray-300 hover:bg-gray-500"
                            onClick={() => {
                              form.change('tag', null);
                              setTagIsDone(false);
                            }}
                          >
                            <Icon
                              icon={CLOSE_SVG}
                              className="h-2 w-2 text-gray-400 group-hover:text-white"
                            />
                          </button>
                        </div>
                      )}
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
