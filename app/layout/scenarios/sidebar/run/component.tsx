import React, {
  useCallback, useMemo, useState,
} from 'react';

import { Form as FormRFF } from 'react-final-form';

import { useRouter } from 'next/router';

import { useRunScenario, useSaveScenario, useScenario } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';

import cx from 'classnames';

import HelpBeacon from 'layout/help/beacon';

import Button from 'components/button';
import Icon from 'components/icon';

import RUN_SVG from 'svgs/ui/run.svg?sprite';

import RunChart from './chart';
import { FIELDS } from './constants';
import RunField from './field';

export interface ScenariosRunProps {
}

export const ScenariosRun: React.FC<ScenariosRunProps> = () => {
  const [advanced, setAdvanced] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { addToast } = useToasts();

  const { query, push } = useRouter();
  const { pid, sid } = query;

  const { data: scenarioData } = useScenario(sid);
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
      metadata: {
        marxanInputParameterFile: values,
      },
    };

    saveScenarioMutation.mutate({ id: `${sid}`, data }, {
      onSuccess: () => {
        runScenarioMutation.mutate({ id: `${sid}` }, {
          onSuccess: ({ data: { data: s } }) => {
            setSubmitting(false);

            addToast('save-scenario-name', (
              <>
                <h2 className="font-medium">Success!</h2>
                <p className="text-sm">Run started</p>
              </>
            ), {
              level: 'success',
            });

            push(`/projects/${pid}`);
            console.info('Scenario name saved succesfully', s);
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
  }, [pid, sid, push, saveScenarioMutation, runScenarioMutation, addToast]);

  return (

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
          <HelpBeacon
            id="run-settings"
            title="RUN OPTIONS"
            subtitle="Marxan settings"
            content={(
              <div className="space-y-5">
                <p>
                  Before you run Marxan, you can adjust some
                  parameters.
                </p>
                <p>
                  All settings are set to the default values recommended
                  by the manual, but you can choose other allowed values.
                </p>
                <p>
                  Some of these parameters have more implications that others.
                  Particularly important is to decide teh Number of Runs,
                  The Clumping and the Conservation Feature missing proportion.
                </p>
              </div>
        )}
            modifiers={['flip']}
            tooltipPlacement="left"
          >
            <h2 className="px-10 text-2xl font-medium font-heading">Run scenario:</h2>
          </HelpBeacon>
          <div className="flex w-full px-10 pt-5 overflow-hidden" style={{ height: 475 }}>

            <div className="flex flex-col flex-grow flex-shrink-0 space-y-6 overflow-hidden w-80">
              <div className="relative flex flex-col flex-grow overflow-hidden">
                <div className="absolute left-0 z-10 w-full h-6 pointer-events-none -top-1 bg-gradient-to-b from-white via-white" />
                <div className="pr-10 overflow-x-hidden overflow-y-auto">
                  <div className="py-6 space-y-10">
                    {FIELDS
                      .filter((f) => !f.advanced)
                      .map((f) => <RunField key={f.id} {...f} />)}

                    {FIELDS
                      .filter((f) => !!advanced && !!f.advanced)
                      .map((f) => <RunField key={f.id} {...f} />)}

                    <Button
                      theme={advanced ? 'secondary' : 'secondary-alt'}
                      size="s"
                      onClick={() => { setAdvanced(!advanced); }}
                    >
                      {advanced && 'Hide advanced settings'}
                      {!advanced && 'Advanced settings'}
                    </Button>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 z-10 w-full h-6 pointer-events-none bg-gradient-to-t from-white via-white" />
              </div>

              <div className="flex-shrink-0 pr-10">
                <Button
                  type="submit"
                  theme="primary"
                  size="base"
                  className="w-full"
                  disabled={submitting}
                >
                  <div className="flex items-center space-x-5">
                    <div className="text-left">
                      <div className="text-lg">Run scenario</div>
                      <div className="text-sm text-gray-500">This will take 10 minutes</div>
                    </div>

                    <Icon icon={RUN_SVG} className="flex-shrink-0 w-7 h-7" />
                  </div>
                </Button>
              </div>
            </div>

            <div className="w-full h-full">
              <RunChart />
            </div>
          </div>
        </form>

      )}

    </FormRFF>

  );
};

export default ScenariosRun;
