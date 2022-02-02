import React, { useMemo, useState } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import { useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import { format } from 'd3';

import { useScenarioCalibrationResults } from 'hooks/scenarios';

import BLMChart from 'layout/scenarios/edit/analysis/blm-calibration/blm-chart';

import Field from 'components/forms/field';
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import { composeValidators } from 'components/forms/validations';
import Icon from 'components/icon';
import InfoButton from 'components/info-button';
import Loading from 'components/loading';

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
                  <div className="absolute right-0">
                    <img src={blmImage || '/images/mock/blm-mock-image.png'} alt="selected blm" className="rounded-lg " />
                    <button
                      className="absolute bottom-0 right-0 z-50 w-5 h-5 rounded-tl-lg rounded-br-lg bg-primary-500"
                      type="button"
                      onClick={() => setZoomImage(true)}
                    >
                      <Icon icon={ZOOM_SVG} />
                    </button>
                  </div>

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
      {zoomImage && <div>Here we have big blm image</div>}
    </>
  );
};

export default ScenariosBlmSettingsGraph;
