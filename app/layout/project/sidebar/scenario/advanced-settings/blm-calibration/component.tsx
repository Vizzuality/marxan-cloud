import React, { useCallback, useState } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';

import { useRouter } from 'next/router';

import { format } from 'd3';
import { motion } from 'framer-motion';
import { usePlausible } from 'next-plausible';

import { useMe } from 'hooks/me';
import { useCanEditScenario } from 'hooks/permissions';
import { useSaveScenarioCalibrationRange, useScenarioCalibrationRange } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import Field from 'components/forms/field';
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import { composeValidators } from 'components/forms/validations';
import InfoButton from 'components/info-button';
import Loading from 'components/loading';
import { ScrollArea } from 'components/scroll-area';
import Section from 'layout/section';

import BlmSettingsChart from './results';

export const ScenariosBLMCalibration = (): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const { query } = useRouter();
  const { pid, sid } = query as { pid: string; sid: string };

  const { addToast } = useToasts();
  const plausible = usePlausible();

  const saveScenarioCalibrationRange = useSaveScenarioCalibrationRange({});
  const editable = useCanEditScenario(pid, sid);
  const { data: user } = useMe();

  const { data: calibrationRange } = useScenarioCalibrationRange(sid);
  const minBlmValue = 0;
  const maxBlmValue = 10000000;

  const onSaveBlmRange = useCallback(
    (values) => {
      setLoading(true);
      const { blmCalibrationFrom, blmCalibrationTo } = values;
      const range = [blmCalibrationFrom, blmCalibrationTo];

      saveScenarioCalibrationRange.mutate(
        {
          sid: `${sid}`,
          data: { range },
        },
        {
          onSuccess: () => {
            setLoading(false);
            addToast(
              'success-calibration-range',
              <>
                <h2 className="font-medium">Success!</h2>
                <p className="text-sm">Scenario calibration sent successfully</p>
              </>,
              {
                level: 'success',
              }
            );
            console.info('Calibration range sent succesfully');
            plausible('Calibrate BLM', {
              props: {
                userId: `${user.id}`,
                userEmail: `${user.email}`,
                projectId: `${pid}`,
                scenarioId: `${sid}`,
              },
            });
          },
          onError: () => {
            setLoading(false);
            addToast(
              'error-calibration-range',
              <>
                <h2 className="font-medium">Error!</h2>
                <p className="text-sm">Scenario calibration could not be sent</p>
              </>,
              {
                level: 'error',
              }
            );

            console.error('Scenario calibration could not be sent');
          },
        }
      );
    },
    [addToast, saveScenarioCalibrationRange, sid, pid, plausible, user.id, user.email]
  );

  const INITIAL_VALUES = {
    blmCalibrationFrom: calibrationRange ? calibrationRange[0] : null,
    blmCalibrationTo: calibrationRange ? calibrationRange[1] : null,
  };

  return (
    <motion.div
      key="cost-surface"
      className="flex min-h-0 flex-col items-start justify-start overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Section className="flex w-full flex-col overflow-hidden">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-blue-400">Advanced Settings</span>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-medium">BLM Calibration</h3>
          </div>
        </div>

        <ScrollArea className="relative h-full before:pointer-events-none before:absolute before:left-0 before:top-0 before:z-10 before:h-6 before:w-full before:bg-gradient-to-b before:from-gray-700 before:via-gray-700 after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:z-10 after:h-6 after:w-full after:bg-gradient-to-t after:from-gray-700 after:via-gray-700">
          <div className="py-6 pr-3">
            {editable && (
              <div className="flex items-center space-x-3">
                <p className="font-heading text-xs uppercase text-white">
                  Select the BLM range and calibrate
                </p>
                <InfoButton>
                  <div>
                    <h4 className="mb-2.5 font-heading text-lg">Calibrate BLM</h4>
                    <div className="space-y-2" />
                  </div>
                </InfoButton>
              </div>
            )}
            <div className="flex min-h-0 w-full flex-col space-y-10 text-sm">
              {editable && (
                <FormRFF initialValues={INITIAL_VALUES} onSubmit={onSaveBlmRange}>
                  {({ handleSubmit, values }) => (
                    <form
                      className="relative mt-5 flex w-full flex-col text-gray-500"
                      autoComplete="off"
                      noValidate
                      onSubmit={handleSubmit}
                    >
                      <Loading
                        visible={loading}
                        className="absolute bottom-0 left-0 right-0 top-0 z-40 flex h-full w-full items-center justify-center bg-gray-700 bg-opacity-90"
                        iconClassName="w-10 h-10 text-primary-500"
                      />

                      <div className="grid w-full grid-cols-2 justify-between gap-x-10">
                        <div className="flex flex-shrink-0 flex-grow items-center">
                          <Label theme="dark" className="mr-3 text-xs uppercase">
                            From
                          </Label>
                          <div className="flex flex-grow flex-col items-end">
                            <FieldRFF
                              name="blmCalibrationFrom"
                              validate={composeValidators([
                                {
                                  presence: true,
                                  numericality: {
                                    greaterThan: minBlmValue,
                                    lessThanOrEqualTo: values.blmCalibrationTo,
                                  },
                                },
                              ])}
                            >
                              {(fprops) => (
                                <Field id="blmCalibrationFrom" className="w-full" {...fprops}>
                                  <Input
                                    mode="dashed"
                                    className="text-2xl"
                                    type="number"
                                    min={minBlmValue}
                                    max={maxBlmValue}
                                    onChange={(e) => {
                                      if (!e.target.value) {
                                        return fprops.input.onChange(null);
                                      }
                                      return fprops.input.onChange(+e.target.value);
                                    }}
                                  />
                                </Field>
                              )}
                            </FieldRFF>
                            <p className="ml-5 whitespace-nowrap text-xs text-white opacity-60">{`min ${format(
                              ',d'
                            )(minBlmValue)}`}</p>
                          </div>
                        </div>

                        <div className="flex flex-shrink-0 flex-grow items-center">
                          <Label theme="dark" className="mr-3 text-xs uppercase">
                            To
                          </Label>
                          <div className="flex flex-grow flex-col items-end">
                            <FieldRFF
                              name="blmCalibrationTo"
                              validate={composeValidators([
                                {
                                  presence: true,
                                  numericality: {
                                    greaterThan: values.blmCalibrationFrom,
                                    lessThanOrEqualTo: maxBlmValue,
                                  },
                                },
                              ])}
                            >
                              {(fprops) => (
                                <Field id="blmCalibrationTo" className="w-full" {...fprops}>
                                  <Input
                                    mode="dashed"
                                    className="text-2xl"
                                    type="number"
                                    min={minBlmValue}
                                    max={maxBlmValue}
                                    onChange={(e) => {
                                      if (!e.target.value) {
                                        return fprops.input.onChange(null);
                                      }
                                      return fprops.input.onChange(+e.target.value);
                                    }}
                                  />
                                </Field>
                              )}
                            </FieldRFF>
                            <p className="ml-5 whitespace-nowrap text-xs text-white opacity-60">{`max ${format(
                              ',d'
                            )(maxBlmValue)}`}</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-5">
                        <Button type="submit" theme="primary-alt" size="base" className="w-full">
                          Calibrate BLM
                        </Button>
                      </div>
                    </form>
                  )}
                </FormRFF>
              )}

              <BlmSettingsChart maxBlmValue={maxBlmValue} minBlmValue={minBlmValue} />
            </div>
          </div>
        </ScrollArea>
      </Section>
    </motion.div>
  );
};

export default ScenariosBLMCalibration;
