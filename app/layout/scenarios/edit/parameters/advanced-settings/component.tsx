import React, { useCallback, useMemo, useState } from 'react';

import { Form as FormRFF } from 'react-final-form';

import { useRouter } from 'next/router';

import cx from 'classnames';
import { motion } from 'framer-motion';
import { usePlausible } from 'next-plausible';
import { ScenarioSidebarTabs, ScenarioSidebarSubTabs } from 'utils/tabs';

import { useMe } from 'hooks/me';
import { useProjectRole } from 'hooks/project-users';
import { useProject } from 'hooks/projects';
import { useRunScenario, useSaveScenario, useScenario } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';

import HelpBeacon from 'layout/help/beacon';

import Button from 'components/button';
import Icon from 'components/icon';

import ARROW_LEFT_SVG from 'svgs/ui/arrow-right-2.svg?sprite';
import RUN_SVG from 'svgs/ui/run.svg?sprite';

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
  const plausible = usePlausible();

  const { query } = useRouter();
  const { pid, sid } = query;

  const { user } = useMe();

  const { data: projectRole } = useProjectRole(pid);
  const VIEWER = projectRole === 'project_viewer';

  const { data: projectData } = useProject(pid);

  const { data: scenarioData } = useScenario(sid);
  const { metadata } = scenarioData || {};
  const { scenarioEditingMetadata } = metadata || {};

  const saveScenarioMutation = useSaveScenario({
    requestConfig: {
      method: 'PATCH',
    },
  });

  const runScenarioMutation = useRunScenario({});

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
      metadata: {
        marxanInputParameterFile: values,
        scenarioEditingMetadata: {
          ...scenarioEditingMetadata,
          lastJobCheck: new Date().getTime(),
          tab: ScenarioSidebarTabs.SOLUTIONS,
          subtab: ScenarioSidebarSubTabs.SOLUTIONS_PREVIEW,
          status: {
            'protected-areas': 'draft',
            features: 'draft',
            analysis: 'draft',
            solutions: 'draft',
          },
        },
      },
    };

    saveScenarioMutation.mutate({ id: `${sid}`, data }, {
      onSuccess: () => {
        runScenarioMutation.mutate({ id: `${sid}` }, {
          onSuccess: ({ data: { data: s } }) => {
            setSubmitting(false);

            addToast('run-start', (
              <>
                <h2 className="font-medium">Success!</h2>
                <p className="text-sm">Run started</p>
              </>
            ), {
              level: 'success',
            });
            console.info('Scenario name saved succesfully', s);

            plausible('Run scenario', {
              props: {
                userId: `${user.id}`,
                userEmail: `${user.email}`,
                projectId: `${pid}`,
                projectName: `${projectData.name}`,
                scenarioId: `${sid}`,
                scenarioName: `${scenarioData?.name}`,
              },
            });
          },
          onError: () => {
            setSubmitting(false);

            addToast('error-run-start', (
              <>
                <h2 className="font-medium">Error!</h2>
                <p className="text-sm">Scenario name not saved</p>
              </>
            ), {
              level: 'error',
            });
          },
        });
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
    pid,
    sid,
    saveScenarioMutation,
    runScenarioMutation,
    addToast,
    scenarioEditingMetadata,
    plausible,
    projectData?.name,
    user?.email,
    user?.id,
    scenarioData?.name,
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
                <div className="flex flex-col flex-grow flex-shrink-0 pt-5 space-y-6 overflow-hidden w-80">
                  <div className="relative flex flex-col flex-grow overflow-hidden">
                    <div className="absolute left-0 z-10 w-full h-6 pointer-events-none -top-1" />
                    <div className="overflow-x-hidden overflow-y-auto">
                      <div className="space-y-10">
                        {FIELDS.map((f) => <RunField key={f.id} {...f} />)}
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 z-10 w-full h-6 pointer-events-none" />
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
                          <div className="text-lg">Run scenario</div>
                        </div>

                        <Icon icon={RUN_SVG} className="flex-shrink-0 w-7 h-7" />
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
