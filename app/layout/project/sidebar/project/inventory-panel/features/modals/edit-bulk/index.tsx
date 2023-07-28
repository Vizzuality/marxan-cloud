import React, { ElementRef, useCallback, useEffect, useRef, useState } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import { useQueryClient } from 'react-query';

import { useRouter } from 'next/router';

import { useSession } from 'next-auth/react';

import { useProjectTags } from 'hooks/projects';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import Field from 'components/forms/field';
import Label from 'components/forms/label';
import Icon from 'components/icon/component';
import { editFeaturesTagsBulk } from 'layout/project/sidebar/project/inventory-panel/features/bulk-action-menu/utils';
import { Feature } from 'types/feature';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

const EditBulkModal = ({
  selectedFeaturesIds,
  handleModal,
}: {
  selectedFeaturesIds: Feature['id'][];
  handleModal: (modalKey: 'delete' | 'edit', isVisible: boolean) => void;
}): JSX.Element => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { query } = useRouter();
  const { addToast } = useToasts();
  const { pid } = query as { pid: string };

  const formRef = useRef(null);
  const tagsSectionRef = useRef<ElementRef<'div'>>(null);

  const [selectedTag, selectTag] = useState<string | null>(null);
  const [tagsMenuOpen, handleTagsMenu] = useState(false);

  const tagsQuery = useProjectTags(pid);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tagsSectionRef.current && !tagsSectionRef.current.contains(event.target)) {
        handleTagsMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, []);

  const handleBulkEdit = useCallback(async () => {
    const data = {
      tagName: selectedTag,
    };

    await editFeaturesTagsBulk(pid, selectedFeaturesIds, session, data)
      .then(async () => {
        await queryClient.invalidateQueries(['all-features', pid]);
        handleModal('edit', false);

        addToast(
          'success-edit-features-tags',
          <>
            <h2 className="font-medium">Success!</h2>
            <p className="text-sm">Types edited</p>
          </>,
          {
            level: 'success',
          }
        );
      })
      .catch(() => {
        addToast(
          'error-edit-features-tags',
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">It is not possible to edit this types</p>
          </>,
          {
            level: 'error',
          }
        );
      });
  }, [addToast, handleModal, pid, selectedTag, selectedFeaturesIds, session, queryClient]);

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      selectTag(event.target.value);
    }
  };

  return (
    <FormRFF<{ tag: Feature['tag'] }>
      initialValues={{
        tag: '',
      }}
      ref={formRef}
      onSubmit={handleBulkEdit}
      render={({ form, handleSubmit }) => {
        formRef.current = form;

        return (
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex flex-col space-y-8 px-8 py-1">
              <h2 className="font-heading font-bold text-black">Edit type</h2>

              <div ref={tagsSectionRef}>
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
                            className="h-10 w-full rounded-md border border-gray-300 px-3 text-gray-800 focus:border-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Type to pick or create tag..."
                            value={fprops.input.value}
                            onFocus={() => handleTagsMenu(true)}
                            onKeyDown={(e) => handleKeyPress(e)}
                          />
                          {!tagsMenuOpen && (
                            <p className="mt-1 font-sans text-xxs text-gray-300">
                              * Changes to selected features will automatically update related
                              scenarios.
                            </p>
                          )}

                          {tagsMenuOpen && (
                            <div className="mt-2 h-24 w-full">
                              <div className="absolute -left-[2%] flex w-[104%] flex-col space-y-2.5 rounded-md bg-white p-4 font-sans text-gray-800 shadow-md">
                                <div className="text-sm text-gray-800">Recent:</div>
                                <div className="flex flex-wrap gap-2.5">
                                  {tagsQuery.isFetched &&
                                    tagsQuery.data?.map((tag) => (
                                      <button
                                        key={tag}
                                        className="inline-block rounded-2xl border border-yellow-600 bg-yellow-400/50 px-3 py-0.5"
                                        onClick={() => selectTag(tag)}
                                      >
                                        <p className="text-sm capitalize text-gray-800">{tag}</p>
                                      </button>
                                    ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {selectedTag && (
                        <div className="flex items-center space-x-1">
                          <div className="inline-block items-center space-x-2 rounded-2xl border border-yellow-600 bg-yellow-400/50 px-3 py-0.5 hover:bg-yellow-600">
                            <p className="text-sm capitalize text-gray-800">{selectedTag}</p>
                          </div>
                          <button
                            className="group flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-gray-300 hover:bg-gray-500"
                            onClick={() => selectTag(null)}
                          >
                            <Icon
                              icon={CLOSE_SVG}
                              className="h-2 w-2 text-gray-400  group-hover:text-white"
                            />
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

export default EditBulkModal;
