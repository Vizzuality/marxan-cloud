import React, { useCallback, useState, useRef } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';

import cx from 'classnames';

import { useRouter } from 'next/router';

import { AnimatePresence, motion } from 'framer-motion';

import { useCanEditProject } from 'hooks/permissions';
import { useProject, useSaveProject } from 'hooks/projects';
import { useToasts } from 'hooks/toast';

import { composeValidators } from 'components/forms/validations';
import Icon from 'components/icon';

import EDIT_SVG from 'svgs/project/edit.svg?sprite';
import CHECKED_SVG from 'svgs/ui/checked.svg?sprite';
import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

export interface TitleProps {}

export const Title: React.FC<TitleProps> = () => {
  const [editting, setEditting] = useState(false);

  const textRefArea = useRef(null);

  const { query } = useRouter();
  const { pid } = query as { pid: string };

  const { addToast } = useToasts();

  const { data: projectData } = useProject(pid);

  const editable = useCanEditProject(pid);

  // Project mutation and submit
  const saveProjectMutation = useSaveProject({
    requestConfig: {
      method: 'PATCH',
    },
  });

  const handleEdition = () => {
    if (!editting && editable) {
      const $input = document.getElementById('form-title-show-project-input');
      setTimeout(() => {
        if ($input instanceof HTMLElement) {
          $input.focus();
        }
      }, 0);
    }
    setEditting(true);
  };

  const handleCancel = useCallback((form) => {
    setEditting(false);
    form.reset();
  }, []);

  const handleSubmit = useCallback(
    (data) => {
      // Blur children
      const $input = document.getElementById('form-title-show-project-input');
      if ($input instanceof HTMLElement) {
        $input.blur();
      }

      if (data.name !== projectData?.name || data.description !== projectData?.description) {
        saveProjectMutation.mutate(
          { id: projectData.id, data },
          {
            onSuccess: ({ data: { data: s } }) => {
              addToast(
                'success-project-name',
                <>
                  <h2 className="font-medium">Success!</h2>
                  <p className="text-sm">Project metadata saved</p>
                </>,
                {
                  level: 'success',
                }
              );

              console.info('Project name saved succesfully', s);
            },
            onError: () => {
              addToast(
                'error-project-name',
                <>
                  <h2 className="font-medium">Error!</h2>
                  <p className="text-sm">Project metadata not saved</p>
                </>,
                {
                  level: 'error',
                }
              );

              console.error('Project name not saved');
            },
          }
        );
      }

      setEditting(false);
    },
    [projectData, addToast, saveProjectMutation]
  );

  const invisibleValue = useCallback((value) => {
    if (value) {
      return value.replace(/\s/g, '-');
    }
    return value;
  }, []);

  return (
    <AnimatePresence exitBeforeEnter>
      {projectData?.name && (
        <motion.div
          key="project-name"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
        >
          {projectData?.name && (
            <FormRFF
              onSubmit={handleSubmit}
              mutators={{
                setTrimName: (args, state, utils) => {
                  const [name] = args;
                  utils.changeValue(state, 'name', () => name.trim());
                },
              }}
              initialValues={{
                name: projectData?.name || '',
                description: projectData?.description || '',
              }}
            >
              {(fprops) => (
                <form
                  id="form-title-show-project"
                  onSubmit={fprops.handleSubmit}
                  autoComplete="off"
                  className={cx({
                    relative: true,
                  })}
                >
                  {/* INPUTS */}
                  <div className="flex items-start justify-items-start space-x-2.5">
                    <FieldRFF
                      name="name"
                      validate={composeValidators([{ presence: true }])}
                      beforeSubmit={() => {
                        const { values } = fprops;
                        fprops.form.mutators.setTrimName(values.name);
                      }}
                    >
                      {({ input }) => (
                        <div
                          className={cx({
                            'relative h-16': true,
                          })}
                        >
                          <div className="relative h-full overflow-hidden">
                            <input
                              {...input}
                              id="form-title-show-project-input"
                              className={cx({
                                'absolute left-0 top-0 h-full w-full overflow-ellipsis border-none bg-transparent font-heading text-4xl font-normal transition-colors focus:bg-primary-300 focus:text-gray-500 focus:outline-none':
                                  true,
                              })}
                              disabled={!editting}
                              value={`${input.value}`}
                            />

                            <h1 className="invisible h-full overflow-ellipsis px-0 py-1 font-heading text-4xl font-normal">
                              {invisibleValue(input?.value)}
                            </h1>
                          </div>
                        </div>
                      )}
                    </FieldRFF>

                    {/* BUTTONS */}
                    <div className="relative right-0 top-2.5 flex space-x-2">
                      {editable && !editting && (
                        <motion.button
                          key="edit-button"
                          type="button"
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -10, opacity: 0 }}
                          className={cx({
                            'flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-500 px-3 transition-colors hover:border-gray-300 focus:outline-none':
                              true,
                            'bg-white': editting,
                            'bg-transparent': !editting,
                          })}
                          onClick={handleEdition}
                        >
                          <Icon
                            icon={EDIT_SVG}
                            className={cx({
                              'h-4 w-4 transition-colors': true,
                              'text-white': !editting,
                              'text-black': editting,
                            })}
                          />
                        </motion.button>
                      )}
                      {editable && editting && (
                        <motion.button
                          key="save-button"
                          type="submit"
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -10, opacity: 0 }}
                          className={cx({
                            'flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-500 px-3 transition-colors hover:border-gray-300 focus:outline-none':
                              true,
                            'bg-white': editting,
                          })}
                        >
                          <Icon
                            icon={CHECKED_SVG}
                            className={cx({
                              'h-4 w-4 text-green-500 transition-colors': true,
                            })}
                          />
                        </motion.button>
                      )}

                      {editable && editting && (
                        <motion.button
                          key="cancel-button"
                          type="button"
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -10, opacity: 0 }}
                          className={cx({
                            'flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-500 px-3 transition-colors hover:border-gray-300 focus:outline-none':
                              true,
                            'bg-white': editting,
                          })}
                          onClick={() => handleCancel(fprops.form)}
                        >
                          <Icon
                            icon={CLOSE_SVG}
                            className={cx({
                              'h-3 w-3 text-red-500 transition-colors': true,
                            })}
                          />
                        </motion.button>
                      )}
                    </div>
                  </div>
                  <FieldRFF<string>
                    name="description"
                    validate={composeValidators([{ presence: true }])}
                  >
                    {({ input }) => (
                      <div
                        className={cx({
                          'relative w-full': true,
                        })}
                      >
                        <div className="relative">
                          <div>
                            <p className="text-s invisible absolute left-0 top-0 font-heading font-normal text-gray-200">
                              {input.value}
                            </p>
                            <textarea
                              {...input}
                              ref={textRefArea}
                              id="form-description-show-project-input"
                              className="text-s absolute left-0 top-0 z-50 h-full w-full overflow-ellipsis border-none bg-transparent font-heading font-normal text-opacity-0 opacity-0 transition-colors focus:bg-primary-300 focus:text-gray-500 focus:opacity-100 focus:outline-none"
                              disabled={!editting}
                              value={`${input.value}`}
                              onChange={(v) => {
                                input.onChange(v);
                                const textArea = textRefArea.current;
                                if (textArea) {
                                  textArea.style.height = '';
                                  textArea.style.height = `${textArea.scrollHeight}px`;
                                }
                              }}
                              onFocus={() => {
                                input.onFocus();
                                const textArea = textRefArea.current;
                                if (textArea) {
                                  textArea.style.height = '';
                                  textArea.style.height = `${textArea.scrollHeight}px`;
                                }
                              }}
                            />
                          </div>
                          <p className="text-s line-clamp-3 font-heading font-normal text-gray-200">
                            {input.value}
                          </p>
                        </div>
                      </div>
                    )}
                  </FieldRFF>
                </form>
              )}
            </FormRFF>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Title;
