import React, { useCallback, useMemo } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import { useDispatch, useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { format } from 'd3';

import BLMChart from 'layout/scenarios/edit/analysis/blm-calibration/blm-chart';

import Field from 'components/forms/field';
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import { composeValidators } from 'components/forms/validations';
import InfoButton from 'components/info-button';

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

  const { blm, blmImage } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

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
              className="relative flex flex-col flex-grow overflow-hidden text-white pt-7"
              autoComplete="off"
              noValidate
              onSubmit={handleSubmit}
            >
              {!!blmImage && (
                <img src={blmImage} alt="selected blm" className="absolute right-0 rounded-lg" />
              )}
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
                  <p className="text-sm whitespace-pre opacity-50">{`max ${format(',d')(maxBlmValue)}`}</p>
                </div>
              </div>
              <div className="flex flex-col mt-8 space-y-2">
                <h3 className="text-sm font-bold text-white">Boundary Length</h3>
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
