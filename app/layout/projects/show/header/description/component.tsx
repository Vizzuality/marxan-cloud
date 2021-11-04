import React, { useCallback } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';

import { useRouter } from 'next/router';

import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';

import { useProject, useSaveProject } from 'hooks/projects';
import { useToasts } from 'hooks/toast';

import {
  composeValidators,
} from 'components/forms/validations';
import Tooltip from 'components/tooltip';

export interface DescriptionProps {
  editable?: boolean;
}

export const Description: React.FC<DescriptionProps> = ({ editable }: DescriptionProps) => {
  const { query } = useRouter();
  const { addToast } = useToasts();
  const { pid } = query;
  const { data: projectData, isLoading: projectIsLoading } = useProject(pid);

  // Project mutation and submit
  const saveProjectMutation = useSaveProject({
    requestConfig: {
      method: 'PATCH',
    },
  });

  const handleProjectSubmit = useCallback((data, form) => {
    // Blur children
    const $form = document.getElementById('form-description-project');
    form.getRegisteredFields().forEach((n) => {
      const element = $form.querySelector(`[description="${n}"]`);

      if (element instanceof HTMLElement) {
        element.blur();
      }
    });

    const { description } = data;

    saveProjectMutation.mutate({ id: projectData.id, ...data, description }, {

      onSuccess: ({ data: { data: s } }) => {
        addToast('success-project-description', (
          <>
            <h2 className="font-medium">Success!</h2>
            <p className="text-sm">Project description saved</p>
          </>
        ), {
          level: 'success',
        });

        console.info('Project description saved succesfully', s);
      },
      onError: () => {
        addToast('error-project-description', (
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">Project name not saved</p>
          </>
        ), {
          level: 'error',
        });

        console.error('Project description not saved');
      },
    });
  }, [projectData?.id, addToast, saveProjectMutation]);

  return (
    <AnimatePresence>
      {!projectIsLoading && (
        <motion.div
          key="project-loading"
          className="flex divide-x"
          initial={{ y: -10 }}
          animate={{ y: 0 }}
          exit={{ y: -10 }}
        >
          {/* Project description */}
          {projectData?.description && (
            <FormRFF
              onSubmit={handleProjectSubmit}
              mutators={{
                setTrimName: (args, state, utils) => {
                  const [description] = args;
                  utils.changeValue(state, 'description', () => description.trim());
                },
              }}
              initialValues={{
                name: projectData?.description || '',
              }}
            >
              {(fprops) => (
                <form
                  id="form-description-project"
                  onSubmit={fprops.handleSubmit}
                  autoComplete="off"
                  className="relative w-full h-12 px-2"
                >
                  <FieldRFF
                    name="name"
                    validate={composeValidators([{ presence: true }])}
                    beforeSubmit={() => {
                      const { values } = fprops;
                      fprops.form.mutators.setTrimName(values.name);
                    }}
                  >
                    {({ input, meta }) => (
                      <Tooltip
                        arrow
                        placement="bottom"
                        disabled={meta.active || editable}
                        content={(
                          <div className="px-2 py-1 text-gray-500 bg-white rounded">
                            <span>Edit description</span>
                          </div>
                        )}
                      >
                        <div className="relative h-12">
                          {editable && (
                            <input
                              {...input}
                              className="absolute top-0 left-0 w-full h-full text-xl font-normal leading-4 bg-transparent border-none overflow-ellipsis opacity-80 font-heading focus:outline-none"
                              value={`${input.value}`}
                              onBlur={() => {
                                input.onBlur();
                                fprops.handleSubmit();
                              }}
                            />
                          )}

                          <h1 className={cx({
                            'h-full px-1.5 font-heading font-normal leading-4': true,
                            invisible: editable,
                            'absolute top-0 left-0 text-xl font-normal overflow-ellipsis opacity-80 font-heading focus:outline-none': !editable,
                          })}
                          >
                            {input.value}
                          </h1>
                        </div>
                      </Tooltip>
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

export default Description;
