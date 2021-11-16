import React, { useCallback, useMemo } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import { useDispatch, useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { format } from 'd3';

import Button from 'components/button';
import Field from 'components/forms/field';
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import { composeValidators } from 'components/forms/validations';
import InfoButton from 'components/info-button';
import BLMChart from 'components/scenarios/blm-chart/component';

import { DATA } from './constants';

export interface ScenariosBlmProps {
  maxBlmValue: number,
  minBlmValue: number,
  setBlmModal: (blmModal: boolean) => void,
}

export const ScenariosBlm: React.FC<ScenariosBlmProps> = ({
  maxBlmValue,
  minBlmValue,
  setBlmModal,
}: ScenariosBlmProps) => {
  const { query } = useRouter();
  const { sid } = query;

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setBlm } = scenarioSlice.actions;

  const dispatch = useDispatch();

  const { blm } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const onSaveBlm = useCallback((values) => {
    dispatch(setBlm(values?.blmCalibration));
    setBlmModal(false);
  }, [dispatch, setBlm, setBlmModal]);

  const INITIAL_VALUES = useMemo(() => {
    return {
      blmCalibration: blm,
    };
  }, [blm]);

  return (
    <div className="flex">
      <FormRFF
        onSubmit={onSaveBlm}
        initialValues={INITIAL_VALUES}
      >

        {({ handleSubmit, form }) => {
          const { valid } = form.getState();

          return (
            <form
              className="flex flex-col flex-grow w-1/5 px-10 overflow-hidden text-gray-500"
              autoComplete="off"
              noValidate
              onSubmit={handleSubmit}
            >

              <h2 className="text-2xl font-medium font-heading">Calibrate BLM</h2>

              <p className="pt-5 text-sm mb-7">Select one of the graph dots or introduce the BLM number.</p>

              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <Label theme="light" className="text-lg font-medium uppercase font-heading">BLM:</Label>
                  <InfoButton
                    size="s"
                    theme="secondary"
                  >
                    <h4 className="font-heading text-lg mb-2.5">What is BLM?</h4>
                  </InfoButton>
                </div>
                <div className="flex items-end w-full space-x-5">
                  <FieldRFF
                    name="blmCalibration"
                    validate={composeValidators([{ presence: true }])}
                  >
                    {(fprops) => (
                      <Field id="blmCalibration" {...fprops}>
                        <Input
                          mode="dashed"
                          theme="light"
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
                  <p className="text-sm whitespace-pre opacity-50">{`max ${format(',d')(maxBlmValue)}`}</p>
                </div>
              </div>

              <Button
                className="mt-auto"
                disabled={!valid}
                theme="primary"
                size="xl"
                type="submit"
              >
                Save
              </Button>

            </form>
          );
        }}
      </FormRFF>

      <div className="relative z-20 w-3/5 mt-20 mr-10 h-96">
        <BLMChart data={DATA} />
      </div>

    </div>
  );
};

export default ScenariosBlm;
