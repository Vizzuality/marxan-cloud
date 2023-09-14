import { useCallback, useRef, useState } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';

import { useRouter } from 'next/router';

import { AnimatePresence, motion } from 'framer-motion';

import { useCanEditProject } from 'hooks/permissions';
import { useProject, useSaveProject } from 'hooks/projects';
import { useToasts } from 'hooks/toast';

import { composeValidators } from 'components/forms/validations';
import Icon from 'components/icon/component';
import { cn } from 'utils/cn';

import EDIT_SVG from 'svgs/project/edit.svg?sprite';
import CHECKED_SVG from 'svgs/ui/checked.svg?sprite';
import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

const ProjectTitle = (): JSX.Element => {
  const { addToast } = useToasts();
  const { query } = useRouter();
  const { pid } = query as { pid: string };

  const [editting, setEditting] = useState(false);
  const textRefArea = useRef(null);

  const { data: projectData } = useProject(pid);

  const editable = useCanEditProject(pid);

  const saveProjectMutation = useSaveProject({
    requestConfig: {
      method: 'PATCH',
    },
  });

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
            onSuccess: () => {
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
            },
          }
        );
      }

      setEditting(false);
    },
    [projectData, addToast, saveProjectMutation]
  );

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
                  className={cn({
                    relative: true,
                  })}
                >
                  {/* INPUTS */}
                  <div className="flex items-center justify-items-start space-x-1">
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
                          className={cn({
                            'relative h-16': true,
                          })}
                        >
                          <div className="relative h-full max-w-[260px] overflow-hidden">
                            <input
                              {...input}
                              id="form-title-show-project-input"
                              className={cn({
                                'absolute left-0 top-0 h-full w-full cursor-pointer overflow-ellipsis border-none bg-transparent px-1.5 font-heading text-3xl focus:bg-primary-300 focus:text-gray-600 focus:outline-none':
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
                    <div className="relative right-0 flex space-x-0.5">
                      {editable && !editting && (
                        <motion.button
                          key="edit-button"
                          type="button"
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -10, opacity: 0 }}
                          className={cn({
                            'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-gray-600 transition-colors hover:border-gray-400 focus:outline-none':
                              true,
                            'bg-white': editting,
                            'bg-transparent': !editting,
                          })}
                          onClick={handleEdition}
                        >
                          <Icon
                            icon={EDIT_SVG}
                            className={cn({
                              'h-5 w-5 transition-colors': true,
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
                          className={cn({
                            'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-gray-600 px-2 transition-colors hover:border-gray-400 focus:outline-none':
                              true,
                            'bg-white': editting,
                          })}
                        >
                          <Icon
                            icon={CHECKED_SVG}
                            className={cn({
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
                          className={cn({
                            'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-gray-600 px-2 transition-colors hover:border-gray-400 focus:outline-none':
                              true,
                            'bg-white': editting,
                          })}
                          onClick={() => handleCancel(fprops.form)}
                        >
                          <Icon
                            icon={CLOSE_SVG}
                            className={cn({
                              'h-3 w-3 text-red-600 transition-colors': true,
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
                        className={cn({
                          'relative w-full': true,
                        })}
                      >
                        <div className="relative">
                          <div>
                            <p className="invisible absolute left-0 top-0 font-heading text-sm font-normal text-white">
                              {input.value}
                            </p>
                            <textarea
                              {...input}
                              ref={textRefArea}
                              id="form-description-show-project-input"
                              className="absolute left-0 top-0 z-50 h-full w-full overflow-ellipsis border-none bg-transparent font-heading text-sm font-normal text-opacity-0 opacity-0 transition-colors focus:bg-primary-300 focus:text-gray-600 focus:opacity-100 focus:outline-none"
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
                          <p className="line-clamp-3 font-heading text-sm font-normal text-white">
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

export default ProjectTitle;
