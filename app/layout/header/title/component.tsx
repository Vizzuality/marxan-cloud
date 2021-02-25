import React, { useCallback } from 'react';

import { useProject, useSaveProject } from 'hooks/projects';
import { useScenario, useSaveScenario } from 'hooks/scenarios';
import { useRouter } from 'next/router';
import { useTransition, animated } from 'react-spring';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import {
  composeValidators,
} from 'components/forms/validations';

export interface TitleProps {
}

export const Title: React.FC<TitleProps> = () => {
  const { query } = useRouter();
  const { pid, sid } = query;
  const { data: projectData, isLoading: projectIsLoading } = useProject(pid);
  const { data: scenarioData, isLoading: scenarioIsLoading } = useScenario(sid);

  const transitions = useTransition((!projectIsLoading && !scenarioIsLoading), null, {
    from: { opacity: 0, transform: 'translateY(-5px)' },
    enter: { opacity: 1, transform: 'translateY(0)' },
    leave: { opacity: 0, transform: 'translateY(-5px)' },
  });

  // Project mutation and submit
  const saveProjectMutation = useSaveProject({
    requestConfig: {
      method: 'PATCH',
      url: `/${projectData?.id}`,
    },
  });

  const handleProjectSubmit = useCallback((data, form) => {
    // Blur children
    const $form = document.getElementById('form-title-project');
    form.getRegisteredFields().forEach((name) => {
      const element = $form.querySelector(`[name="${name}"]`);

      if (element instanceof HTMLElement) {
        element.blur();
      }
    });

    saveProjectMutation.mutate(data, {
      onSuccess: ({ data: s }) => {
        console.info('Project name saved succesfully', s);
      },
      onError: () => {
        console.error('Project name not saved');
      },
    });
  }, [saveProjectMutation]);

  // Scenario mutation and submit
  const saveScenarioMutation = useSaveScenario({
    requestConfig: {
      method: 'PATCH',
      url: `/${scenarioData?.id}`,
    },
  });

  const handleScenarioSubmit = useCallback((data, form) => {
    // Blur children
    const $form = document.getElementById('form-title-scenario');
    form.getRegisteredFields().forEach((name) => {
      const element = $form.querySelector(`[name="${name}"]`);

      if (element instanceof HTMLElement) {
        element.blur();
      }
    });

    saveScenarioMutation.mutate(data, {
      onSuccess: ({ data: s }) => {
        console.info('Scenario name saved succesfully', s);
      },
      onError: () => {
        console.error('Scenario name not saved');
      },
    });
  }, [saveScenarioMutation]);

  return (
    <>
      {transitions.map(({ item, key, props }) => item && (
        <animated.div key={key} style={props} className="flex divide-x">
          {/* Project title */}
          {projectData?.name && (
            <FormRFF
              onSubmit={handleProjectSubmit}
              initialValues={{
                name: projectData?.name || '',
              }}
            >
              {(fprops) => (
                <form id="form-title-project" onSubmit={fprops.handleSubmit} autoComplete="off" className="relative max-w-xs px-2">
                  <FieldRFF
                    name="name"
                    validate={composeValidators([{ presence: true }])}
                  >
                    {({ input }) => (
                      <div className="relative h-6">
                        <input
                          {...input}
                          className="absolute top-0 left-0 w-full h-full px-1 py-1 font-normal leading-4 bg-transparent border-none font-heading overflow-ellipsis"
                          value={`${input.value}`}
                          onBlur={fprops.handleSubmit}
                        />
                        <h1 className="invisible px-1.5 py-1 font-heading font-normal leading-4">{input.value}</h1>
                      </div>

                    )}
                  </FieldRFF>
                </form>
              )}
            </FormRFF>
          )}

          {/* Scenario title */}
          {scenarioData?.name && (
            <FormRFF
              onSubmit={handleScenarioSubmit}
              initialValues={{
                name: scenarioData?.name || '',
              }}
            >
              {(fprops) => (
                <form id="form-title-scenario" onSubmit={fprops.handleSubmit} autoComplete="off" className="relative max-w-xs px-2">
                  <FieldRFF
                    name="name"
                    validate={composeValidators([{ presence: true }])}
                  >
                    {({ input }) => (
                      <div className="relative h-6">
                        <input
                          {...input}
                          id="form-scenario-name"
                          className="absolute top-0 left-0 w-full h-full px-1 py-1 font-sans font-normal leading-4 bg-transparent border-none overflow-ellipsis"
                          value={`${input.value}`}
                          onBlur={fprops.handleSubmit}
                        />
                        <h1 className="invisible px-1.5 py-1 font-sans font-normal leading-4">{input.value}</h1>
                      </div>
                    )}
                  </FieldRFF>
                </form>
              )}
            </FormRFF>
          )}
        </animated.div>
      ))}
    </>
  );
};

export default Title;
