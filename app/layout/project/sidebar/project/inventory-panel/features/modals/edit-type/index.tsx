import React, { useCallback, useRef, useState } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';

import { useRouter } from 'next/router';

import { useEditProjectTags, useProjectTags } from 'hooks/projects';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import Field from 'components/forms/field';
import Label from 'components/forms/label';
import Icon from 'components/icon/component';
import { ProjectFeature } from 'types/project-model';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

const EditTypeModal = ({
  feature,
  handleModal,
}: {
  feature: ProjectFeature;
  handleModal: (modalKey: 'delete' | 'edit', isVisible: boolean) => void;
}): JSX.Element => {
  const { query } = useRouter();
  const { addToast } = useToasts();
  const { pid } = query as { pid: string };

  const formRef = useRef(null);
  const [selectedTag, selectTag] = useState(null);
  const [tagsMenuOpen, handleTagsMenu] = useState(false);

  const tagsQuery = useProjectTags(pid);

  const editProjectTagsMutation = useEditProjectTags();

  const onEditSubmit = useCallback(
    (values) => {
      console.log('VALUES', values);
      const data = {
        tagName: feature.tag,
        updatedTagName: selectedTag,
      };

      editProjectTagsMutation.mutate(
        { projectId: `${pid}`, data },
        {
          onSuccess: () => {
            addToast(
              'success-edit-project-tag',
              <>
                <h2 className="font-medium">Success!</h2>
                <p className="text-sm">Tag edited</p>
              </>,
              {
                level: 'success',
              }
            );
          },
          onError: () => {
            addToast(
              'error-edit-project-tag',
              <>
                <h2 className="font-medium">Error!</h2>
                <p className="text-sm">It is not possible to edit this type</p>
              </>,
              {
                level: 'error',
              }
            );
          },
        }
      );
    },
    [pid, addToast, editProjectTagsMutation, feature, selectedTag]
  );

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      selectTag(event.target.value);
    }
  };

  return (
    <FormRFF<{ featureClassName: ProjectFeature['featureClassName']; tag: ProjectFeature['tag'] }>
      initialValues={{
        tag: '',
      }}
      ref={formRef}
      onSubmit={onEditSubmit}
      render={({ form, handleSubmit }) => {
        formRef.current = form;

        return (
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col space-y-8 px-8 py-1">
              <h2 className="font-heading font-bold text-black">Edit type</h2>

              <div>
                <FieldRFF name="tag">
                  {(fprops) => (
                    <Field id="tag" {...fprops} className="relative">
                      <Label
                        theme="light"
                        className="mb-3 font-heading text-xs font-semibold uppercase"
                      >
                        Add type
                      </Label>

                      {!selectedTag && (
                        <>
                          <input
                            {...fprops.input}
                            className="h-10 w-full rounded-md border border-gray-300 px-3 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Type to pick or create tag..."
                            value={fprops.input.value}
                            onFocus={() => handleTagsMenu(!tagsMenuOpen)}
                            onKeyDown={(e) => handleKeyPress(e)}
                          />

                          {tagsMenuOpen && (
                            <div className="mt-2 flex w-full flex-col space-y-2.5 rounded-md bg-white p-4 font-sans text-gray-800 shadow-md">
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
                          )}
                        </>
                      )}

                      {selectedTag && (
                        <div className="flex items-center space-x-1">
                          <div className="inline-block items-center space-x-2 rounded-2xl border border-yellow-600 bg-yellow-400/50 px-3 py-0.5">
                            <p className="text-sm capitalize text-gray-800">
                              {selectedTag.replace(/_/g, ' ')}
                            </p>
                          </div>
                          <button
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-300"
                            onClick={() => selectTag(null)}
                          >
                            <Icon icon={CLOSE_SVG} className="h-2 w-2 text-gray-400" />
                          </button>
                        </div>
                      )}
                    </Field>
                  )}
                </FieldRFF>
              </div>

              <div className="flex justify-center space-x-4">
                <Button theme="secondary" size="xl" onClick={() => handleModal('edit', false)}>
                  Cancel
                </Button>

                <Button theme="primary" size="xl" type="submit" disabled={!selectedTag}>
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

export default EditTypeModal;