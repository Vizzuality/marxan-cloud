import React, { useState } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import { useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import { format } from 'd3';
import { motion } from 'framer-motion';

import Blm from 'layout/scenarios/edit/analysis/blm-calibration/blm';

import Button from 'components/button';
import Field from 'components/forms/field';
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import { composeValidators } from 'components/forms/validations';
import Icon from 'components/icon';
import InfoButton from 'components/info-button';
import Modal from 'components/modal';

import ARROW_LEFT_SVG from 'svgs/ui/arrow-right-2.svg?sprite';

export interface ScenariosBLMCalibrationProps {
  onChangeSection: (s: string) => void;
}

export const ScenariosBLMCalibration: React.FC<ScenariosBLMCalibrationProps> = ({
  onChangeSection,
}: ScenariosBLMCalibrationProps) => {
  const { query } = useRouter();
  const { sid } = query;

  const [blmModal, setBlmModal] = useState(false);
  const minBlmValue = 0;
  const maxBlmValue = 10000000;

  const { blm } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

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
          <h4 className="text-xs uppercase font-heading text-primary-500">CALIBRATE BLM</h4>
        </button>
        <InfoButton>
          <div>
            <h4 className="font-heading text-lg mb-2.5">Calibrate BLM</h4>
            <div className="space-y-2" />

          </div>
        </InfoButton>

      </header>

      <div className="relative flex flex-col flex-grow w-full min-h-0 pt-2 mt-1 space-y-5 overflow-hidden text-sm">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          In a iaculis nulla. Duis aliquam lacus massa, id sollicitudin massa.
        </p>
        <p>
          Select the BLM range and calibrate.
        </p>
        <FormRFF
          onSubmit={() => console.log('onSubmit')}
        // initialValues={INITIAL_VALUES}
        >

          {({ handleSubmit }) => (
            <form
              className="flex flex-col flex-grow w-full space-y-5 overflow-hidden text-gray-500"
              autoComplete="off"
              noValidate
              onSubmit={handleSubmit}
            >
              <div className="flex items-end">
                <Label theme="dark" className="mr-5 text-sm uppercase opacity-50">From:</Label>
                <div className="w-30">
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
                </div>
              </div>

              <div className="flex items-end">
                <Label theme="dark" className="mr-10 text-sm uppercase opacity-50">To:</Label>
                <div className="w-30">
                  <FieldRFF
                    name="blmCalibrationTo"
                    validate={composeValidators([{ presence: true }])}
                  >
                    {(fprops) => (
                      <Field id="blmCalibrationTo" {...fprops}>
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
                </div>
                <p className="ml-5 text-sm">{`max ${format(',d')(maxBlmValue)}`}</p>
              </div>
            </form>
          )}
        </FormRFF>
        <div className="pt-5">
          <Button
            theme="primary-alt"
            size="base"
            className="w-full"
            onClick={() => setBlmModal(true)}
          >
            Calibrate BLM
          </Button>
        </div>
        {blm && (
          <p> hay blm </p>
        )}
        <Modal
          title="BLM"
          open={blmModal}
          size="wide"
          onDismiss={() => setBlmModal(false)}
        >
          <Blm setBlmModal={setBlmModal} maxBlmValue={maxBlmValue} minBlmValue={minBlmValue} />
        </Modal>
      </div>
    </motion.div>
  );
};

export default ScenariosBLMCalibration;
