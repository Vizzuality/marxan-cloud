import React, { useCallback, useMemo, useState } from 'react';

import { Form as FormRFF } from 'react-final-form';

import { useRouter } from 'next/router';

import cx from 'classnames';
import { motion } from 'framer-motion';
import { ScenarioSidebarTabs } from 'utils/tabs';
import { mergeScenarioStatusMetaData } from 'utils/utils-scenarios';

import { useProjectRole } from 'hooks/project-users';
import { useSaveScenario, useScenario } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';

import HelpBeacon from 'layout/help/beacon';

import Button from 'components/button';
import Icon from 'components/icon';

import ARROW_LEFT_SVG from 'svgs/ui/arrow-right-2.svg?sprite';

import { FIELDS } from './constants';
import RunField from './field';

export interface ScenariosAdvancedSettingsProps {
  onChangeSection: (s: string) => void;
}

export const ScenariosAdvancedSettings: React.FC<ScenariosAdvancedSettingsProps> = ({
  onChangeSection,
}: ScenariosAdvancedSettingsProps) => {
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToasts();

  const { query } = useRouter();
  const { pid, sid } = query;

  const { data: projectRole } = useProjectRole(pid);
  const VIEWER = projectRole === 'project_viewer';

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
        [f.id]: scenarioParamters[f.id] || f.default,
      };
    }, {});
  }, [scenarioData]);

  const onSubmit = useCallback((values) => {
    setSubmitting(true);

    const data = {
      numberOfRuns: values.NUMREPS,
      boundaryLengthModifier: values.BLM,
      metadata: mergeScenarioStatusMetaData({
        ...metadata,
        marxanInputParameterFile: values,
      }, {
        tab: ScenarioSidebarTabs.PARAMETERS,
        subtab: null,
      }),
    };

    saveScenarioMutation.mutate({ id: `${sid}`, data }, {
      onSuccess: () => {
        setSubmitting(false);
        addToast('success-advanced-setting', (
          <>
            <h2 className="font-medium">Success!</h2>
            <p className="text-sm">Advanced settings saved</p>
          </>
        ), {
          level: 'success',
        });
        console.info('Advanced settings saved succesfully');
      },
      onError: () => {
        setSubmitting(false);

        addToast('error-scenario-name', (
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">Scenario name not saved</p>
          </>
        ), {
          level: 'error',
        });
      },
    });
  }, [
    sid,
    metadata,
    saveScenarioMutation,
    addToast,
  ]);

  return (
    <motion.div
      key="cost-surface"
      className="flex flex-col items-start justify-start min-h-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="flex items-center pt-5 pb-1 space-x-3">
        <button
          type="button"
          className="flex items-center w-full space-x-2 text-left focus:outline-none"
          onClick={() => {
            onChangeSection(null);
          }}
        >
          <Icon icon={ARROW_LEFT_SVG} className="w-3 h-3 transform rotate-180 text-primary-500" />
          <h4 className="text-xs uppercase font-heading text-primary-500">Advanced Settings</h4>
        </button>
      </header>

      <FormRFF
        onSubmit={onSubmit}
        initialValues={INITIAL_VALUES}
      >

        {({ handleSubmit }) => (
          <form
            className={cx({
              'w-full overflow-hidden flex flex-col flex-grow text-gray-500': true,
            })}
            autoComplete="off"
            noValidate
            onSubmit={handleSubmit}
          >

            <div className="flex w-full overflow-hidden" style={{ height: 475 }}>
              <HelpBeacon
                id="run-settings"
                title="RUN OPTIONS"
                subtitle="Marxan settings"
                content={(
                  <div className="space-y-2">
                    <p>
                      Before you run Marxan, you can adjust some
                      parameters.
                    </p>
                    <p>
                      Everything is pre-set to the default values recommended
                      by the Marxan manual, but you can choose other allowed values.
                    </p>
                    <p>
                      Some of these parameters have more implications that others.
                      Particularly important is to decide the
                      {' '}
                      <b>Number of Runs</b>
                      ,
                      the
                      {' '}
                      <b>Clumping</b>
                      {' '}
                      and the
                      {' '}
                      <b>Conservation Feature missing proportion</b>
                    </p>
                  </div>
                )}
                beaconClassName="z-50"
                modifiers={['flip']}
                tooltipPlacement="right"
              >
                <div className="flex flex-col flex-grow flex-shrink-0 pt-5 space-y-6 overflow-hidden">
                  <div className="relative flex flex-col flex-grow overflow-x-hidden overflow-y-auto">
                    <div className="mr-12 space-y-10">
                      {FIELDS.map((f) => <RunField key={f.id} {...f} />)}
                    </div>
                  </div>

                  <div className="flex-shrink-0 px-10">
                    <Button
                      type="submit"
                      theme="primary"
                      size="base"
                      className="w-full"
                      disabled={submitting || VIEWER}
                    >
                      <div className="flex items-center space-x-5">
                        <div className="text-left">
                          <div className="text-lg">Save</div>
                        </div>
                      </div>
                    </Button>
                  </div>
                </div>
              </HelpBeacon>
            </div>
          </form>

        )}
      </FormRFF>
    </motion.div>
  );
};

export default ScenariosAdvancedSettings;
