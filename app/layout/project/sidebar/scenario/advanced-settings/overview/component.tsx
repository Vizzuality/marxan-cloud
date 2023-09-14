import React, { useCallback, useMemo, useState } from 'react';

import { Form as FormRFF } from 'react-final-form';

import { useRouter } from 'next/router';

import { motion } from 'framer-motion';

import { useCanEditScenario } from 'hooks/permissions';
import { useSaveScenario, useScenario } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import { ScrollArea } from 'components/scroll-area';
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
      className="flex h-full flex-col items-start justify-start overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Section className="h-full w-full overflow-hidden">
        <div className="flex h-full flex-col space-y-1">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-blue-400">Advanced Settings</span>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-medium">Overview</h3>
            </div>
          </div>

          <div className="h-full overflow-hidden">
            <FormRFF onSubmit={onSubmit} initialValues={INITIAL_VALUES}>
              {({ handleSubmit }) => (
                <form
                  autoComplete="off"
                  noValidate
                  onSubmit={handleSubmit}
                  className="relative flex h-full flex-col"
                >
                  <div className="relative flex h-full flex-col overflow-hidden before:pointer-events-none before:absolute before:left-0 before:top-0 before:z-10 before:h-6 before:w-full before:bg-gradient-to-b before:from-gray-800 before:via-gray-800 after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:z-10 after:h-6 after:w-full after:bg-gradient-to-t after:from-gray-800 after:via-gray-800">
                    <ScrollArea className="h-full pr-4">
                      <div className="space-y-10 py-5">
                        {FIELDS.map((f) => (
                          <RunField key={f.id} {...f} />
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                  {editable && (
                    <div className="flex w-full py-5">
                      <Button
                        type="submit"
                        theme="primary"
                        size="base"
                        className="flex w-full items-center space-x-5 text-lg"
                        disabled={submitting}
                      >
                        Save
                      </Button>
                    </div>
                  )}
                </form>
              )}
            </FormRFF>
          </div>
        </div>
      </Section>
    </motion.div>
  );
};

export default ScenariosAdvancedSettings;
