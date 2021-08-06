import React, {
  useCallback, useMemo, useState,
} from 'react';

import { Form as FormRFF } from 'react-final-form';

import { useRouter } from 'next/router';

import cx from 'classnames';

import { useRunScenario, useSaveScenario, useScenario } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';

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
            console.info('Scenario name saved succesfully', s);
            push(`/projects/${pid}`);
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
          <h2 className="px-10 text-2xl font-medium font-heading">Run scenario:</h2>

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
              beaconClassName="z-50"
              modifiers={['flip']}
              tooltipPlacement="right"
            >
              <div className="flex flex-col flex-grow flex-shrink-0 pt-5 space-y-6 overflow-hidden w-80">
                <div className="relative flex flex-col flex-grow overflow-hidden">
                  <div className="absolute left-0 z-10 w-full h-6 pointer-events-none -top-1 bg-gradient-to-b from-white via-white" />
                  <div className="overflow-x-hidden overflow-y-auto">
                    <div className="px-10 py-6 space-y-10">
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
                        <div className="text-lg">Run scenario</div>
                        {/*
                          <div className="text-sm text-gray-500">This will take 10 minutes</div>
                        */}
                      </div>

                      <Icon icon={RUN_SVG} className="flex-shrink-0 w-7 h-7" />
                    </div>
                  </Button>
                </div>
              </div>
            </HelpBeacon>

            <div className="w-full h-full">
              <HelpBeacon
                id="run-chart"
                title="RUN CHART"
                subtitle="Marxan chart"
                content={(
                  <div className="space-y-2">
                    <p>
                      On this chart you can see the effect of
                      using different BLM values on your final
                      conservation plan.
                    </p>
                    <p>
                      The recommended value represents the one that
                      minimizes the boundary length and the cost.
                    </p>
                    <p>
                      However, you may prefer to select a different value
                      if your plan requires more or less aggregation of planning
                      units. You can make that decision by
                      looking at the images, where you can see the approximate
                      distribution of your planning units with each BLM value.
                    </p>
                  </div>
                )}
                beaconClassName="z-50"
                modifiers={['flip']}
                tooltipPlacement="left"
              >
                <div className="w-full h-full">
                  <RunChart />
                </div>
              </HelpBeacon>
            </div>
          </div>
        </form>

      )}

    </FormRFF>

  );
};

export default ScenariosRun;
