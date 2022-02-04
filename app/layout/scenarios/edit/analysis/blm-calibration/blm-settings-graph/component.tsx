import React, { useMemo, useState } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import { useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import {
  OverlayContainer,
} from '@react-aria/overlays';
import { format } from 'd3';
import { AnimatePresence, motion } from 'framer-motion';

import { useScenarioCalibrationResults } from 'hooks/scenarios';

import BLMChart from 'layout/scenarios/edit/analysis/blm-calibration/blm-chart';

import Field from 'components/forms/field';
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import { composeValidators } from 'components/forms/validations';
import Icon from 'components/icon';
import InfoButton from 'components/info-button';
import Loading from 'components/loading';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';
import ZOOM_SVG from 'svgs/ui/zoom.svg?sprite';

export interface ScenariosBlmSettingsGraphProps {
  maxBlmValue: number,
  minBlmValue: number,
}

export const ScenariosBlmSettingsGraph: React.FC<ScenariosBlmSettingsGraphProps> = ({
  maxBlmValue,
  minBlmValue,
}: ScenariosBlmSettingsGraphProps) => {
  const [zoomImage, setZoomImage] = useState(false);

  const { query } = useRouter();
  const { sid } = query;

  const { blm, blmImage } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const {
    data: calibrationResultsData,
    isFetching: calibrationResultsAreFetching,
    isFetched: calibrationResultsAreFetched,
  } = useScenarioCalibrationResults(sid);

  const INITIAL_VALUES = useMemo(() => {
    return {
      blmCalibration: blm?.toFixed(2),
    };
  }, [blm]);

  return (
    <>
      <div className="flex">
        {calibrationResultsAreFetched && !!calibrationResultsData.length && (
          <FormRFF
            onSubmit={() => { }}
            initialValues={INITIAL_VALUES}
          >
            {({ handleSubmit }) => {
              return (
                <form
                  className="relative flex flex-col flex-grow pt-10 overflow-hidden text-white border-t border-gray-500"
                  autoComplete="off"
                  noValidate
                  onSubmit={handleSubmit}
                >
                  <button
                    className="absolute right-0"
                    type="button"
                    onClick={() => setZoomImage(true)}
                  >
                    <img src={blmImage || '/images/mock/blm-mock-image.png'} alt="selected blm" className="border-2 border-transparent rounded-lg hover:border-primary-500" />
                    <div className="absolute bottom-0 right-0 z-50 w-5 h-5 mb-0.5 mr-0.5 rounded-tl-lg rounded-br-lg bg-primary-500">
                      <Icon icon={ZOOM_SVG} />
                    </div>
                  </button>

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

                  <>
                    <div className="flex flex-col mt-8 space-y-2">
                      <h3 className="text-sm font-bold text-white">Boundary Length</h3>
                      <p className="text-xs text-white">
                        More
                      </p>
                    </div>
                    <div className="w-full h-32">
                      <BLMChart data={calibrationResultsData} />
                    </div>
                  </>
                </form>
              );
            }}
          </FormRFF>
        )}
      </div>
      {calibrationResultsAreFetching && !calibrationResultsData && (
        <div className="py-10">
          <Loading
            className="flex items-center justify-center w-full h-full text-white"
            iconClassName="w-10 h-10"
            visible
          />
        </div>
      )}
      <AnimatePresence>
        {zoomImage && (
          <OverlayContainer>
            <motion.div
              id="overlay"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: zoomImage ? 1 : 0,
                transition: {
                  delay: 0,
                },
              }}
              exit={{
                opacity: 0,
                transition: {
                  delay: 0.125,
                },
              }}
              className="fixed inset-0 z-50 bg-black bg-blur"
            >
              <div className="absolute left-0 right-0 w-full h-full mx-auto text-center top-2/4">
                <button
                  className="relative"
                  type="button"
                  onClick={() => setZoomImage(false)}
                >
                  <img src={blmImage || '/images/mock/blm-mock-image.png'} alt="selected blm" className="border-4 border-transparent rounded-xl hover:border-primary-500 w-60 h-60" />
                  <div className="absolute bottom-0 right-0 z-50 flex items-center justify-center w-6 h-6 mb-1 mr-1 rounded-tl-lg rounded-br-xl bg-primary-500">
                    <Icon icon={CLOSE_SVG} className="w-3 h-3 text-black" />
                  </div>
                </button>
              </div>

            </motion.div>
          </OverlayContainer>
        )}
      </AnimatePresence>

    </>
  );
};

export default ScenariosBlmSettingsGraph;
