import React, { useCallback, useMemo } from 'react';
import cx from 'classnames';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';

import Button from 'components/button';
import Field from 'components/forms/field';
import Label from 'components/forms/label';
import Input from 'components/forms/input';
import BLMChart from 'components/scenarios/blm-chart';
import InfoButton from 'components/info-button';

import {
  composeValidators,
} from 'components/forms/validations';

import { FIELDS, DATA } from './constants';

export interface ScenariosRunProps {
}

export const ScenariosRun: React.FC<ScenariosRunProps> = () => {
  const INITIAL_VALUES = useMemo(() => {
    return FIELDS.reduce((acc, f) => {
      return {
        ...acc,
        [f.id]: f.default,
      };
    }, {});
  }, []);

  const onSubmit = useCallback((values) => {
    console.info(values);
  }, []);

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
          onSubmit={handleSubmit}
        >
          <h2 className="px-10 text-2xl font-medium font-heading">Run scenario:</h2>
          <div className="flex w-full px-10 pt-5 space-x-10 overflow-hidden" style={{ height: 450 }}>

            <div className="flex flex-col flex-grow w-5/12 space-y-6 overflow-hidden">
              <div className="relative flex flex-col flex-grow overflow-hidden">
                <div className="absolute left-0 z-10 w-full h-6 -top-1 bg-gradient-to-b from-white via-white" />
                <div className="overflow-x-hidden overflow-y-auto">
                  <div className="py-6 space-y-10">
                    {FIELDS.map((f) => (
                      <FieldRFF
                        key={f.id}
                        name={f.id}
                        validate={composeValidators(f.validations)}
                      >
                        {(fprops) => (
                          <div className="">
                            <div className="flex items-center">
                              <Label theme="light" className="mr-2 text-lg font-heading">{f.label}</Label>
                              <InfoButton>
                                <span>{f.description}</span>
                              </InfoButton>
                            </div>

                            {f.note && (
                              <div className="uppercase text-xxs font-heading">{f.note}</div>
                            )}

                            <div className="flex items-baseline mt-2 space-x-2">
                              <div className="w-40">
                                <Field id={f.id} {...fprops}>
                                  <Input
                                    {...f.input}
                                    theme="light"
                                    mode="dashed"
                                    onChange={(e) => {
                                      if (!e.target.value) {
                                        return fprops.input.onChange(null);
                                      }
                                      return fprops.input.onChange(+e.target.value);
                                    }}
                                  />
                                </Field>
                              </div>

                              {!!f.input.max && (
                                <span>
                                  max
                                  {' '}
                                  {f.input.max}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </FieldRFF>
                    ))}
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 z-10 w-full h-6 bg-gradient-to-t from-white via-white" />
              </div>

              <div className="flex-shrink-0">
                <Button
                  type="submit"
                  theme="primary"
                  size="base"
                  className="w-full"
                >
                  <div className="text-left">
                    <div className="text-lg">Run scenario</div>
                    <div className="text-sm text-gray-500">This will take 10 minutes</div>
                  </div>
                </Button>
              </div>
            </div>

            <div className="relative w-7/12 h-full p-5">
              <div className="absolute top-0 left-0 z-0 w-full h-full opacity-25 bg-gradient-to-b from-white to-blue-50 rounded-3xl" />
              <div
                className="relative z-10 h-full"
              >
                <BLMChart data={DATA} />
              </div>
            </div>
          </div>
        </form>
      )}
    </FormRFF>
  );
};

export default ScenariosRun;
