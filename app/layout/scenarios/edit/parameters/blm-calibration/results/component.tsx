import React, { useCallback, useMemo, useState } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';

import { useRouter } from 'next/router';

import cx from 'classnames';
import { ScenarioSidebarSubTabs, ScenarioSidebarTabs } from 'utils/tabs';
import { blmFormat } from 'utils/units';
import { mergeScenarioStatusMetaData } from 'utils/utils-scenarios';

import { useCanEditScenario } from 'hooks/permissions';
import { useSaveScenario, useScenario, useScenarioCalibrationResults } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';

import BlmChart from 'layout/scenarios/edit/parameters/blm-calibration/chart';

import Button from 'components/button';
import Field from 'components/forms/field';
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import { composeValidators } from 'components/forms/validations';
import InfoButton from 'components/info-button';
import Loading from 'components/loading';

import ScenariosBlmResultsCard from './card';

export interface ScenariosBlmResultsProps {
  maxBlmValue: number,
  minBlmValue: number,
}

export const ScenariosBlmResults: React.FC<ScenariosBlmResultsProps> = ({
  maxBlmValue,
  minBlmValue,
}: ScenariosBlmResultsProps) => {
  const [submitting, setSubmitting] = useState(false);

  const { query } = useRouter();
  const { pid, sid } = query;

  const { addToast } = useToasts();

  const editable = useCanEditScenario(pid, sid);

  const { data: scenarioData } = useScenario(sid);
  const { metadata } = scenarioData || {};
  const { scenarioEditingMetadata, marxanInputParameterFile } = metadata || {};

  const {
    data: calibrationResultsData,
    isFetching: calibrationResultsAreFetching,
    isFetched: calibrationResultsAreFetched,
  } = useScenarioCalibrationResults(sid);

  const BLM = scenarioData?.boundaryLengthModifier || 1;

  const INITIAL_VALUES = useMemo(() => {
    return {
      blmCalibration: BLM,
    };
  }, [BLM]);

  const saveScenarioMutation = useSaveScenario({
    requestConfig: {
      method: 'PATCH',
    },
  });

  const onSaveBlm = useCallback((values) => {
    setSubmitting(true);
    const { blmCalibration } = values;
    const meta = {
      scenarioEditingMetadata,
      marxanInputParameterFile: {
        ...marxanInputParameterFile,
        BLM: blmCalibration,
      },
    };

    saveScenarioMutation.mutate({
      id: `${sid}`,
      data:
      {
        boundaryLengthModifier: blmCalibration,
        metadata: mergeScenarioStatusMetaData(meta, {
          tab: ScenarioSidebarTabs.PARAMETERS,
          subtab: ScenarioSidebarSubTabs.BLM_CALIBRATION,
        }),
      },
    }, {
      onSuccess: ({ data: { data: s } }) => {
        setSubmitting(false);
        addToast('success-save-blm-value', (
          <>
            <h2 className="font-medium">Success!</h2>
            <p className="text-sm">Scenario blm calibration saved</p>
          </>
        ), {
          level: 'success',
        });

        console.info('Scenario blm calibration saved', s);
      },
      onError: () => {
        setSubmitting(false);
        addToast('error-save-blm-value', (
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">Scenario blm calibration not saved</p>
          </>
        ), {
          level: 'error',
        });
      },
    });
  }, [
    sid,
    saveScenarioMutation,
    addToast,
    marxanInputParameterFile,
    scenarioEditingMetadata,
  ]);

  return (
    <>
      <div className="flex">
        {calibrationResultsAreFetched && !!calibrationResultsData.length && (
          <FormRFF
            onSubmit={onSaveBlm}
            initialValues={INITIAL_VALUES}
          >
            {({ form, values, handleSubmit }) => {
              return (
                <form
                  className={cx({
                    'relative flex flex-col flex-grow pt-10 overflow-hidden text-white': true,
                    'border-t border-gray-500': editable,
                  })}
                  autoComplete="off"
                  noValidate
                  onSubmit={handleSubmit}
                >
                  <div className="flex flex-col">

                    <div className="flex items-end w-full space-x-5">
                      <FieldRFF
                        name="blmCalibration"
                        validate={composeValidators([{ presence: true }])}
                      >
                        {(fprops) => (
                          <Field className="w-44" id="blmCalibration" {...fprops}>
                            <Label id="blmCalibration" theme="dark" className="flex items-center space-x-2 text-xs uppercase">
                              <span>BLM:</span>

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
                            </Label>

                            <Input
                              mode="dashed"
                              theme="dark"
                              className="text-2xl"
                              type="number"
                              min={minBlmValue}
                              max={maxBlmValue}
                              disabled={!editable}
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
                      <p className="text-sm whitespace-pre opacity-50">{`max ${blmFormat(maxBlmValue)}`}</p>
                      <Button
                        type="submit"
                        theme="primary"
                        size="base"
                        disabled={!editable}
                      >
                        Save
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-5 mt-10">
                    {calibrationResultsData.map((result) => {
                      const selected = result.blmValue === values.blmCalibration;

                      return (
                        <ScenariosBlmResultsCard
                          key={result.id}
                          {...result}
                          selected={selected}
                          onClick={(v) => {
                            form.change('blmCalibration', v);
                          }}
                        />
                      );
                    })}
                  </div>

                  <div>

                    <h3 className="mt-10 mb-4 text-sm font-bold text-white">Boundary Length</h3>

                    <div className="w-full h-32">
                      <BlmChart
                        data={calibrationResultsData.sort((a, b) => a.cost - b.cost)}
                        selected={values.blmCalibration}
                        onChange={(v) => {
                          form.change('blmCalibration', v);
                        }}
                      />
                    </div>
                  </div>

                  <Loading
                    visible={submitting}
                    className="absolute top-0 left-0 z-10 flex items-center justify-center w-full h-full text-white bg-gray-700 bg-opacity-90"
                    iconClassName="w-10 h-10"
                  />
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
    </>
  );
};

export default ScenariosBlmResults;
