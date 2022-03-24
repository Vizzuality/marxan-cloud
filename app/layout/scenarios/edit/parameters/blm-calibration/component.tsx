import React, { useCallback } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';

import { useRouter } from 'next/router';

import { format } from 'd3';
import { motion } from 'framer-motion';

import { useCanEditScenario } from 'hooks/permissions';
import { useSaveScenarioCalibrationRange, useScenarioCalibrationRange } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';

import BlmSettingsChart from 'layout/scenarios/edit/parameters/blm-calibration/settings-chart';

import Button from 'components/button';
import Field from 'components/forms/field';
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import { composeValidators } from 'components/forms/validations';
import Icon from 'components/icon';
import InfoButton from 'components/info-button';

import ARROW_LEFT_SVG from 'svgs/ui/arrow-right-2.svg?sprite';

export interface ScenariosBLMCalibrationProps {
  onChangeSection: (s: string) => void;
}

export const ScenariosBLMCalibration: React.FC<ScenariosBLMCalibrationProps> = ({
  onChangeSection,
}: ScenariosBLMCalibrationProps) => {
  const { query } = useRouter();
  const { pid, sid } = query;

  const { addToast } = useToasts();

  const saveScenarioCalibrationRange = useSaveScenarioCalibrationRange({});
  const editable = useCanEditScenario(pid, sid);

  const { data: calibrationRange } = useScenarioCalibrationRange(sid);
  const minBlmValue = 0;
  const maxBlmValue = 10000000;

  const onSaveBlmRange = useCallback((values) => {
    const { blmCalibrationFrom, blmCalibrationTo } = values;
    const range = [blmCalibrationFrom, blmCalibrationTo];

    saveScenarioCalibrationRange.mutate({
      id: `${sid}`,
      data: { range },
    }, {
      onSuccess: () => {
        addToast('success-calibration-range', (
          <>
            <h2 className="font-medium">Success!</h2>
            <p className="text-sm">Scenario calibration sent successfully</p>
          </>
        ), {
          level: 'success',
        });
        console.info('Calibration range sent succesfully');
      },
      onError: () => {
        addToast('error-calibration-range', (
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">Scenario calibration could not be sent</p>
          </>
        ), {
          level: 'error',
        });

        console.error('Scenario calibration could not be sent');
      },
    });
  }, [addToast, saveScenarioCalibrationRange, sid]);

  const INITIAL_VALUES = {
    blmCalibrationFrom: calibrationRange ? calibrationRange[0] : null,
    blmCalibrationTo: calibrationRange ? calibrationRange[1] : null,
  };

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
          <h4 className="text-xs uppercase font-heading text-primary-500">BLM Calibration</h4>
        </button>
      </header>

      <div className="relative flex flex-col flex-grow w-full min-h-0 mt-1 overflow-x-hidden overflow-y-auto">
        {editable && (
          <div className="flex items-center space-x-3 mt-9">
            <p className="text-xs text-white uppercase font-heading">Select the BLM range and calibrate</p>
            <InfoButton>
              <div>
                <h4 className="font-heading text-lg mb-2.5">Calibrate BLM</h4>
                <div className="space-y-2" />
              </div>
            </InfoButton>
          </div>
        )}
        <div className="flex flex-col w-full min-h-0 space-y-10 text-sm">
          {editable && (
            <FormRFF
              initialValues={INITIAL_VALUES}
              onSubmit={onSaveBlmRange}
            >
              {({ handleSubmit }) => (
                <form
                  className="flex flex-col w-full mt-5 text-gray-500"
                  autoComplete="off"
                  noValidate
                  onSubmit={handleSubmit}
                >
                  <div className="flex justify-between space-x-6">
                    <div className="flex items-center">
                      <Label theme="dark" className="mr-3 text-xs uppercase">From</Label>
                      <FieldRFF
                        name="blmCalibrationFrom"
                        validate={composeValidators([{ presence: true }])}
                      >
                        {(fprops) => (
                          <Field id="blmCalibrationFrom" {...fprops}>
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
                      <p className="ml-5 text-sm text-white opacity-60 whitespace-nowrap">{`min ${format(',d')(minBlmValue)}`}</p>
                    </div>

                    <div className="flex items-center">
                      <Label theme="dark" className="mr-3 text-xs uppercase">To</Label>
                      <FieldRFF
                        name="blmCalibrationTo"
                        validate={composeValidators([{ presence: true }])}
                      >
                        {(fprops) => (
                          <Field className="w-44" id="blmCalibrationTo" {...fprops}>
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
                      <p className="ml-5 text-sm text-white opacity-60 whitespace-nowrap">{`max ${format(',d')(maxBlmValue)}`}</p>
                    </div>
                  </div>

                  <div className="pt-5">
                    <Button
                      type="submit"
                      theme="primary-alt"
                      size="base"
                      className="w-full"
                    >
                      Calibrate BLM
                    </Button>
                  </div>

                </form>
              )}
            </FormRFF>
          )}

          <BlmSettingsChart
            maxBlmValue={maxBlmValue}
            minBlmValue={minBlmValue}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default ScenariosBLMCalibration;
