import React, { useCallback, useState } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';

import { useRouter } from 'next/router';

import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';

import { useProjectRole } from 'hooks/project-users';
import { useProject, useSaveProject } from 'hooks/projects';
import { useToasts } from 'hooks/toast';

import {
  composeValidators,
} from 'components/forms/validations';
import Icon from 'components/icon';

import EDIT_SVG from 'svgs/project/edit.svg?sprite';

export interface TitleProps {
}

export const Title: React.FC<TitleProps> = () => {
  const [editable, setEditable] = useState(false);
  const [blurring, setBlurring] = useState(false);
  const { query } = useRouter();
  const { pid } = query;

  const { addToast } = useToasts();

  const { data: projectData } = useProject(pid);

  const { data: projectRole } = useProjectRole(pid);
  const OWNER = projectRole === 'project_owner';

  // Project mutation and submit
  const saveProjectMutation = useSaveProject({
    requestConfig: {
      method: 'PATCH',
    },
  });

  const handleEdition = () => {
    if (!editable) {
      const $input = document.getElementById('form-title-show-project-input');
      setTimeout(() => {
        if ($input instanceof HTMLElement) {
          $input.focus();
        }
      }, 0);
    }
    setEditable(true);
  };

  const handleSubmit = useCallback((data) => {
    // Blur children
    const $input = document.getElementById('form-title-show-project-input');
    if ($input instanceof HTMLElement) {
      $input.blur();
    }

    if (data.name !== projectData?.name) {
      saveProjectMutation.mutate({ id: projectData.id, data }, {
        onSuccess: ({ data: { data: s } }) => {
          addToast('success-project-name', (
            <>
              <h2 className="font-medium">Success!</h2>
              <p className="text-sm">Project name saved</p>
            </>
          ), {
            level: 'success',
          });

          console.info('Project name saved succesfully', s);
        },
        onError: () => {
          addToast('error-project-name', (
            <>
              <h2 className="font-medium">Error!</h2>
              <p className="text-sm">Project name not saved</p>
            </>
          ), {
            level: 'error',
          });

          console.error('Project name not saved');
        },
      });
    }

    setEditable(false);
  }, [projectData, addToast, saveProjectMutation]);

  return (
    <AnimatePresence>
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
                  utils.changeValue(state, 'name', () => name);
                },
              }}
              initialValues={{
                name: projectData?.name || '',
              }}
            >
              {(fprops) => (
                <form
                  id="form-title-show-project"
                  onSubmit={fprops.handleSubmit}
                  autoComplete="off"
                  className={cx({
                    'relative h-16 max-w-max': true,
                  })}
                >
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
                          'relative h-16 flex items-center w-full space-x-5': true,
                        })}
                      >
                        <div className="relative h-full overflow-hidden">
                          <input
                            {...input}
                            id="form-title-show-project-input"
                            className={cx({
                              'absolute left-0 focus:bg-primary-300 text-4xl focus:text-gray-500 w-full h-full font-normal top-0 overflow-ellipsis bg-transparent border-none font-heading focus:outline-none transition-colors': true,
                            })}
                            disabled={!editable}
                            value={`${input.value}`}
                            onBlur={() => {
                              setBlurring(true);
                              input.onBlur();
                              fprops.handleSubmit();

                              setTimeout(() => {
                                setBlurring(false);
                              }, 250);
                            }}
                          />

                          <h1 className="invisible h-full px-0 py-1 text-4xl font-normal font-heading overflow-ellipsis">{input?.value}</h1>
                        </div>

                        {OWNER && (
                          <button
                            type="button"
                            className={cx({
                              'cursor-pointer focus:outline-none h-10 w-10 px-3 rounded-full border border-gray-500 flex items-center justify-center transition-colors': true,
                              'bg-white': editable && !blurring,
                              'bg-transparent': !editable || blurring,
                            })}
                            disabled={editable || blurring}
                            onClick={handleEdition}
                          >
                            <Icon
                              icon={EDIT_SVG}
                              className={cx({
                                'w-4 h-4 transition-colors': true,
                                'text-white': !editable || blurring,
                                'text-black': editable && !blurring,
                              })}
                            />
                          </button>
                        )}
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
