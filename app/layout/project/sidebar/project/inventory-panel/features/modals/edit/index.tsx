import React, { useCallback, useRef, useState } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';

import { useRouter } from 'next/router';

import { useFeature, useProjectFeatures } from 'hooks/features';
import { useProjectTags } from 'hooks/projects';

import Button from 'components/button';
import Field from 'components/forms/field';
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import { composeValidators } from 'components/forms/validations';
import { Popover, PopoverContent, PopoverTrigger } from 'components/popover';
import { ProjectFeature } from 'types/project-model';

const EditModal = ({
  featureId,
  handleModal,
}: {
  featureId: ProjectFeature['id'];
  handleModal: (modalKey: 'delete' | 'edit', isVisible: boolean) => void;
}): JSX.Element => {
  const { query } = useRouter();
  const { pid } = query as { pid: string };

  const formRef = useRef(null);
  const [selectedTag, selectTag] = useState(null);

  const tagsQuery = useProjectTags(pid);

  const featureQuery = useProjectFeatures(pid, featureId);

  const onEditSubmit = useCallback((values) => {
    console.log('values', values);
  }, []);

  return (
    <FormRFF<{ featureClassName: ProjectFeature['featureClassName']; tag: ProjectFeature['tag'] }>
      initialValues={{
        featureClassName: featureQuery.data?.[0]?.featureClassName,
        tag: featureQuery.data?.[0]?.tag,
      }}
      ref={formRef}
      onSubmit={onEditSubmit}
      render={({ form, handleSubmit }) => {
        formRef.current = form;

        return (
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col space-y-5 px-8 py-1">
              <h2 className="font-heading font-bold text-black">Edit feature</h2>

              <div>
                <FieldRFF<string>
                  name="featureClassName"
                  validate={composeValidators([{ presence: true }])}
                >
                  {(fprops) => (
                    <Field id="featureClassName" {...fprops}>
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

              <div>
                <FieldRFF<string> name="tag">
                  {(fprops) => (
                    <Field id="tag" {...fprops} className="relative">
                      <Label theme="light" className="mb-3 uppercase">
                        Add type
                      </Label>

                      <Popover>
                        <PopoverTrigger asChild>
                          <input
                            {...fprops.input}
                            className="h-10 w-full rounded-md border border-gray-300 px-3 text-gray-800 focus:border-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Type to pick or create tag..."
                          />
                        </PopoverTrigger>

                        <PopoverContent
                          side="bottom"
                          sideOffset={20}
                          className="!top-6 w-[600px] rounded-[10px] !border-none bg-white p-3"
                          collisionPadding={48}
                        >
                          <div className="flex w-full flex-col space-y-2.5 font-sans text-gray-800">
                            <div className="text-sm text-gray-800">Recent:</div>
                            <div className="flex flex-wrap gap-2.5">
                              {tagsQuery.isFetched &&
                                tagsQuery.data?.map((tag) => {
                                  return (
                                    <button
                                      key={tag}
                                      className="inline-block rounded-2xl border border-yellow-600 bg-yellow-400/50 px-3 py-0.5"
                                      onClick={() => selectTag(tag)}
                                    >
                                      <p className="text-sm capitalize text-gray-800">
                                        {tag.replace(/_/g, ' ')}
                                      </p>
                                    </button>
                                  );
                                })}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
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
