import React, { useCallback, useMemo } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import { useDispatch, useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { format } from 'd3';

import Field from 'components/forms/field';
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import { composeValidators } from 'components/forms/validations';
import InfoButton from 'components/info-button';
import BLMChart from 'components/scenarios/blm-chart';

import { DATA } from './constants';

export interface ScenariosBlmSettingsGraphProps {
  maxBlmValue: number,
  minBlmValue: number,
}

export const ScenariosBlmSettingsGraph: React.FC<ScenariosBlmSettingsGraphProps> = ({
  maxBlmValue,
  minBlmValue,
}: ScenariosBlmSettingsGraphProps) => {
  const { query } = useRouter();
  const { sid } = query;

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setBlm } = scenarioSlice.actions;

  const dispatch = useDispatch();

  const { blm } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const onSaveBlm = useCallback((values) => {
    dispatch(setBlm(values?.blmCalibration));
  }, [dispatch, setBlm]);

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
          return (
            <form
              className="flex flex-col flex-grow space-y-6 overflow-hidden text-white"
              autoComplete="off"
              noValidate
              onSubmit={handleSubmit}
            >
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <Label theme="dark" className="text-xs uppercase">BLM:</Label>
                  <InfoButton
                    size="base"
                    theme="primary"
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
                          theme="dark"
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
                  <p className="text-xs whitespace-pre opacity-50">{`max ${format(',d')(maxBlmValue)}`}</p>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Boundary Length</h3>
                <p className="text-xs text-white">
                  More
                </p>
              </div>
              <div className="w-full h-32">
                <BLMChart data={DATA} />
              </div>
            </form>
          );
        }}
      </FormRFF>

    </div>
  );
};

export default ScenariosBlmSettingsGraph;
