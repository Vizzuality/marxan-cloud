import React, { useMemo } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';

import { useRouter } from 'next/router';

import cx from 'classnames';

import { useScenario } from 'hooks/scenarios';

import Field from 'components/forms/field';
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import { composeValidators } from 'components/forms/validations';

import { FIELDS } from './constants';

export interface ScenariosBlmProps {
}

export const ScenariosBlm: React.FC<ScenariosBlmProps> = () => {
  const { query } = useRouter();
  const { sid } = query;

  const { data: scenarioData } = useScenario(sid);

  const INITIAL_VALUES = useMemo(() => {
    return FIELDS.reduce((acc, f) => {
      const scenarioParamters = scenarioData?.metadata?.marxanInputParameterFile || {};

      return {
        ...acc,
        [f.id]: scenarioParamters[f.id] || f.default,
      };
    }, {});
  }, [scenarioData]);

  return (
    <FormRFF
      onSubmit={() => console.log('onSubmit')}
      initialValues={INITIAL_VALUES}
    >

      {({ handleSubmit }) => (
        <form
          className={cx({
            'px-10 w-full overflow-hidden flex flex-col flex-grow text-gray-500': true,
          })}
          autoComplete="off"
          noValidate
          onSubmit={handleSubmit}
        >
          <h2 className="text-2xl font-medium font-heading">Calibrate BLM</h2>
          <p className="pt-5 text-sm">Select one of the graph dots or introduce the BLM number.</p>
          <div className="flex flex-col mt-4">
            <Label theme="light" className="uppercase text-xxs">BLM:</Label>

            <div className="w-full">
              <FieldRFF
                name="blmCalibration"
                validate={composeValidators([{ presence: true }])}
              >
                {(fprops) => (
                  <Field id="blmCalibration" {...fprops}>
                    <Input
                      mode="dashed"
                      className="text-2xl"
                      type="number"
                      min={0}
                      max={10000000}
                      onChange={(e) => {
                        fprops.input.onChange(+parseInt(e.target.value, 10));
                      }}
                    />
                  </Field>
                )}
              </FieldRFF>
            </div>
          </div>
        </form>

      )}

    </FormRFF>
  );
};

export default ScenariosBlm;
