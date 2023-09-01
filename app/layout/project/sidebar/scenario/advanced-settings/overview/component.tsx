import React, { useCallback, useMemo, useState } from 'react';

import { Form as FormRFF } from 'react-final-form';

import cx from 'classnames';

import { useRouter } from 'next/router';

import { motion } from 'framer-motion';

import { useCanEditScenario } from 'hooks/permissions';
import { useSaveScenario, useScenario } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import Section from 'layout/section';
import { ScenarioSidebarTabs } from 'utils/tabs';
import { mergeScenarioStatusMetaData } from 'utils/utils-scenarios';

import { FIELDS } from './constants';
import RunField from './field';

export const ScenariosAdvancedSettings = (): JSX.Element => {
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToasts();

  const { query } = useRouter();
  const { pid, sid } = query as { pid: string; sid: string };

  const editable = useCanEditScenario(pid, sid);
  const { data: scenarioData } = useScenario(sid);
  const { metadata } = scenarioData || {};

  const saveScenarioMutation = useSaveScenario({
    requestConfig: {
      method: 'PATCH',
    },
  });

  const INITIAL_VALUES = useMemo(() => {
    return FIELDS.reduce((acc, f) => {
      const scenarioParamters = scenarioData?.metadata?.marxanInputParameterFile || {};

      return {
        ...acc,
        [f.id]:
          typeof scenarioParamters[f.id] !== 'undefined' ? scenarioParamters[f.id] : f.default,
      };
    }, {});
  }, [scenarioData]);

  const onSubmit = useCallback(
    (values) => {
      setSubmitting(true);

      const data = {
        numberOfRuns: values.NUMREPS,
        boundaryLengthModifier: values.BLM,
        metadata: mergeScenarioStatusMetaData(
          {
            ...metadata,
            marxanInputParameterFile: values,
          },
          {
            tab: ScenarioSidebarTabs.PARAMETERS,
            subtab: null,
          }
        ),
      };

      saveScenarioMutation.mutate(
        { id: `${sid}`, data },
        {
          onSuccess: () => {
            setSubmitting(false);
            addToast(
              'success-advanced-setting',
              <>
                <h2 className="font-medium">Success!</h2>
                <p className="text-sm">Advanced settings saved</p>
              </>,
              {
                level: 'success',
              }
            );
            console.info('Advanced settings saved succesfully');
          },
          onError: () => {
            setSubmitting(false);

            addToast(
              'error-scenario-name',
              <>
                <h2 className="font-medium">Error!</h2>
                <p className="text-sm">Scenario name not saved</p>
              </>,
              {
                level: 'error',
              }
            );
          },
        }
      );
    },
    [sid, metadata, saveScenarioMutation, addToast]
  );

  return (
    <motion.div
      key="cost-surface"
      className="flex min-h-0 flex-col items-start justify-start overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Section className="w-full">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-blue-400">Advanced Settings</span>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-medium">Overview</h3>
          </div>
        </div>

        <FormRFF onSubmit={onSubmit} initialValues={INITIAL_VALUES}>
          {({ handleSubmit }) => (
            <form
              className={cx({
                // 'flex w-full flex-grow flex-col text-gray-500': true,
              })}
              autoComplete="off"
              noValidate
              onSubmit={handleSubmit}
            >
              <div className="flex h-full w-full overflow-hidden">
                <div className="flex w-full flex-grow flex-col space-y-6  pt-5">
                  <div className="relative flex flex-grow flex-col">
                    <div className="max-h-full space-y-10">
                      {FIELDS.map((f) => (
                        <RunField key={f.id} {...f} />
                      ))}
                    </div>
                  </div>

                  {editable && (
                    <div className="flex-shrink-0 px-10">
                      <Button
                        type="submit"
                        theme="primary"
                        size="base"
                        className="w-full"
                        disabled={submitting}
                      >
                        <div className="flex items-center space-x-5">
                          <div className="text-left">
                            <div className="text-lg">Save</div>
                          </div>
                        </div>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </form>
          )}
        </FormRFF>
      </Section>
    </motion.div>
  );
};

export default ScenariosAdvancedSettings;
