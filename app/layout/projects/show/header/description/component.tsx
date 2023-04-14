import React, { useCallback } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';

import cx from 'classnames';

import { useRouter } from 'next/router';

import { AnimatePresence, motion } from 'framer-motion';

import { useProject, useSaveProject } from 'hooks/projects';
import { useToasts } from 'hooks/toast';

import { composeValidators } from 'components/forms/validations';

export interface DescriptionProps {
  editable?: boolean;
}

export const Description: React.FC<DescriptionProps> = ({ editable = false }: DescriptionProps) => {
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

  const handleProjectSubmit = useCallback(
    (data) => {
      const { description } = data;

      saveProjectMutation.mutate(
        { id: projectData.id, data: { description } },
        {
          onSuccess: ({ data: { data: s } }) => {
            addToast(
              'success-project-description',
              <>
                <h2 className="font-medium">Success!</h2>
                <p className="text-sm">Project description saved</p>
              </>,
              {
                level: 'success',
              }
            );

            console.info('Project description saved succesfully', s);
          },
          onError: () => {
            addToast(
              'error-project-description',
              <>
                <h2 className="font-medium">Error!</h2>
                <p className="text-sm">Project name not saved</p>
              </>,
              {
                level: 'error',
              }
            );

            console.error('Project description not saved');
          },
        }
      );
    },
    [projectData?.id, addToast, saveProjectMutation]
  );

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
                  className="relative h-12 w-full px-2"
                >
                  <FieldRFF<string>
                    name="name"
                    validate={composeValidators([{ presence: true }])}
                    beforeSubmit={() => {
                      const { values } = fprops;
                      fprops.form.mutators.setTrimName(values.name);
                    }}
                  >
                    {({ input }) => (
                      <div className="relative h-12">
                        <input
                          {...input}
                          className="text-s leading-1 absolute left-0 top-0 h-full w-full cursor-pointer overflow-ellipsis border-none bg-transparent font-heading font-normal opacity-80 focus:outline-none"
                          value={`${input.value}`}
                          disabled={!editable}
                          onBlur={() => {
                            input.onBlur();
                            fprops.handleSubmit();
                          }}
                        />

                        <h1
                          className={cx({
                            'invisible h-full px-1.5 font-heading font-normal leading-4': true,
                          })}
                        >
                          {input.value}
                        </h1>
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

export default Description;
