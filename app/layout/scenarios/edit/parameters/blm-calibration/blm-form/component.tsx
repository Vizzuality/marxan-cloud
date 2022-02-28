import React, { useMemo, useState } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import { useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import { format } from 'd3';

import { useScenario, useScenarioCalibrationResults } from 'hooks/scenarios';

import BLMChart from 'layout/scenarios/edit/parameters/blm-calibration/blm-form/chart';
import BlmImageModal from 'layout/scenarios/edit/parameters/blm-calibration/blm-form/image-modal';

import Field from 'components/forms/field';
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import { composeValidators } from 'components/forms/validations';
import Icon from 'components/icon';
import InfoButton from 'components/info-button';
import Loading from 'components/loading';

import ZOOM_SVG from 'svgs/ui/zoom.svg?sprite';

export interface ScenariosBlmSettingsChartProps {
  maxBlmValue: number,
  minBlmValue: number,
}

export const ScenariosBlmSettingsChart: React.FC<ScenariosBlmSettingsChartProps> = ({
  maxBlmValue,
  minBlmValue,
}: ScenariosBlmSettingsChartProps) => {
  const [zoomImage, setZoomImage] = useState(false);

  const { query } = useRouter();
  const { sid } = query;

  const { blmImage } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const { data: scenarioData } = useScenario(sid);

  const {
    data: calibrationResultsData,
    isFetching: calibrationResultsAreFetching,
    isFetched: calibrationResultsAreFetched,
  } = useScenarioCalibrationResults(sid);

  const BLM = scenarioData?.boundaryLengthModifier || 1;

  const INITIAL_VALUES = useMemo(() => {
    return {
      blmCalibration: BLM < 10 ? BLM.toFixed(2) : BLM.toFixed(),
    };
  }, [BLM]);

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
                    <div className="absolute bottom-0 right-0 z-50 w-5 h-5 mb-px mr-px rounded-tl-lg rounded-br-md bg-primary-500">
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
                        <div className="space-y-2">
                          <h4 className="font-heading text-lg mb-2.5">Boundary Length Modifier (BLM)</h4>
                          <p>
                            The BLM should be either ‘0’ or a positive number.
                          </p>
                          <p>
                            It is permissible for the BLM to include decimal
                            points (e.g. 0.1). Setting the BLM to ‘0’ will
                            remove boundary length from consideration altogether.
                          </p>
                          <p>
                            There is no universally good value for the BLM,
                            as it works in relation to the costs and
                            geometry of the study region/planning units.
                          </p>
                          <p>
                            With a small BLM, Marxan will concentrate on
                            minimizing overall reserve cost and will only
                            aim for compactness when little extra cost will
                            be incurred.
                          </p>
                          <p>
                            Alternatively, a large BLM will
                            place a high emphasis on minimizing the
                            boundary length, even if it means a more
                            costly solution.
                          </p>
                        </div>
                      </InfoButton>
                    </div>
                    <div className="flex items-end w-full space-x-5">
                      <FieldRFF
                        name="blmCalibration"
                        validate={composeValidators([{ presence: true }])}
                      >
                        {(fprops) => (
                          <Field className="w-44" id="blmCalibration" {...fprops}>
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

      <BlmImageModal blmImage={blmImage} zoomImage={zoomImage} setZoomImage={setZoomImage} />

    </>
  );
};

export default ScenariosBlmSettingsChart;
