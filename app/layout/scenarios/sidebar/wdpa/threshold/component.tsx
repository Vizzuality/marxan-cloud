import React, {
  useCallback, useMemo, useState, useEffect,
} from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import { useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { useProject } from 'hooks/projects';
import { useScenario, useSaveScenario } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';
import { useWDPACategories } from 'hooks/wdpa';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { getScenarioStatusMetaData } from 'utils/utils-scenarios';

import Button from 'components/button';
import Field from 'components/forms/field';
import Label from 'components/forms/label';
import Slider from 'components/forms/slider';
import {
  composeValidators,
} from 'components/forms/validations';
import InfoButton from 'components/info-button';
import Loading from 'components/loading';

import THRESHOLD_IMG from 'images/info-buttons/img_threshold.png';

export interface WDPAThresholdCategories {
  readOnly?: boolean;
  onSuccess: () => void;
  onBack: () => void;
}

export const WDPAThreshold: React.FC<WDPAThresholdCategories> = ({
  readOnly,
  onSuccess,
  onBack,
}: WDPAThresholdCategories) => {
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToasts();
  const { query } = useRouter();
  const { pid, sid } = query;

  const { data: projectData } = useProject(pid);

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setWDPAThreshold } = scenarioSlice.actions;
  const dispatch = useDispatch();

  const {
    data: scenarioData,
    isFetching: scenarioIsFetching,
    isFetched: scenarioIsFetched,
  } = useScenario(sid);
  const { metadata } = scenarioData || {};
  const { scenarioEditingMetadata } = metadata || {};

  const {
    data: wdpaData,
    isFetching: wdpaIsFetching,
    isFetched: wdpaIsFetched,
  } = useWDPACategories(
    projectData?.adminAreaLevel2Id
    || projectData?.adminAreaLevel1Id
    || projectData?.countryId,
  );
  const mutation = useSaveScenario({
    requestConfig: {
      method: 'PATCH',
    },
  });

  const labelRef = React.useRef(null);

  const WDPA_CATEGORIES_OPTIONS = useMemo(() => {
    if (!wdpaData) return [];

    return wdpaData.map((w) => ({
      label: `IUCN ${w.iucnCategory}`,
      value: w.id,
    }));
  }, [wdpaData]);

  const INITIAL_VALUES = useMemo(() => {
    const { wdpaThreshold, wdpaIucnCategories } = scenarioData;

    return {
      wdpaThreshold: wdpaThreshold ? wdpaThreshold / 100 : 0.75,
      wdpaIucnCategories: wdpaIucnCategories || [],
    };
  }, [scenarioData]);

  useEffect(() => {
    const { wdpaThreshold } = scenarioData;
    dispatch(setWDPAThreshold(wdpaThreshold ? wdpaThreshold / 100 : 0.75));
  }, [scenarioData]); //eslint-disable-line

  const onSubmit = useCallback(async (values) => {
    setSubmitting(true);

    const { wdpaThreshold } = values;

    mutation.mutate({
      id: scenarioData.id,
      data: {
        wdpaThreshold: +(wdpaThreshold * 100).toFixed(0),
        metadata: getScenarioStatusMetaData(scenarioEditingMetadata, 'features', 'features', 'features-preview'),
      },
    }, {
      onSuccess: () => {
        setSubmitting(false);

        addToast('save-scenario-wdpa', (
          <>
            <h2 className="font-medium">Success!</h2>
            <p className="text-sm">Scenario WDPA saved</p>
          </>
        ), {
          level: 'success',
        });
        onSuccess();
      },
      onError: () => {
        setSubmitting(false);

        addToast('error-scenario-wdpa', (
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">Scenario WDPA not saved</p>
          </>
        ), {
          level: 'error',
        });
      },
    });
  }, [mutation, scenarioData?.id, addToast, onSuccess, scenarioEditingMetadata]);

  // Loading
  if ((scenarioIsFetching && !scenarioIsFetched) || (wdpaIsFetching && !wdpaIsFetched)) {
    return (
      <Loading
        visible
        className="relative flex items-center justify-center w-full h-16"
        iconClassName="w-5 h-5 text-white"
      />
    );
  }

  return (
    <FormRFF
      onSubmit={onSubmit}
      initialValues={INITIAL_VALUES}
    >
      {({ values, handleSubmit }) => (
        <form onSubmit={handleSubmit} autoComplete="off" className="relative flex flex-col flex-grow w-full overflow-hidden">
          <div className="relative flex flex-col flex-grow overflow-hidden">
            <div className="absolute top-0 left-0 z-10 w-full h-6 pointer-events-none bg-gradient-to-b from-gray-700 via-gray-700" />

            <div className="relative px-0.5 overflow-x-visible overflow-y-auto">
              <div className="py-6">
                {/* WDPA */}
                <div>
                  <FieldRFF
                    name="wdpaThreshold"
                    validate={composeValidators([{ presence: true }])}
                  >
                    {(flprops) => (
                      <Field id="scenario-wdpaThreshold" {...flprops}>
                        <div className="flex items-center mb-3">
                          <Label ref={labelRef} theme="dark" className="mr-3 uppercase">Set the threshold for protected areas</Label>
                          <InfoButton>
                            <div>
                              <h4 className="font-heading text-lg mb-2.5">What is a threshold?</h4>
                              <div className="space-y-2">
                                <p>
                                  Inside Marxan, planning units are considered as either
                                  protected
                                  or not protected.
                                </p>
                                <p>
                                  The threshold value represents a
                                  percentage of the area
                                  inside a planning unit. By setting the threshold you decide
                                  how much of a protected area needs to fall inside a
                                  planning unit to consider the whole planning unit
                                  as &quot;protected&quot;.
                                </p>
                                <p>
                                  The following
                                  image shows an example setting a threshold of 50%:
                                </p>
                              </div>

                              <img src={THRESHOLD_IMG} alt="Threshold" />

                            </div>
                          </InfoButton>
                        </div>

                        <p
                          className="mb-3 text-sm text-gray-300"
                        >
                          Refers to what percentage of a planning unit must
                          {' '}
                          be covered by a protected area to be considered “protected”.
                        </p>

                        <Slider
                          labelRef={labelRef}
                          theme="dark"
                          defaultValue={values.wdpaThreshold}
                          formatOptions={{
                            style: 'percent',
                          }}
                          maxValue={1}
                          minValue={0.01}
                          step={0.01}
                          onChange={(s) => {
                            flprops.input.onChange(s);
                            dispatch(setWDPAThreshold(s));
                          }}
                        />
                      </Field>
                    )}
                  </FieldRFF>
                </div>

                <div className="mt-10">
                  <h3 className="text-sm">Selected protected areas:</h3>

                  <div className="flex flex-wrap mt-2.5">
                    {INITIAL_VALUES.wdpaIucnCategories
                    && INITIAL_VALUES.wdpaIucnCategories.map((w) => {
                      const wdpa = WDPA_CATEGORIES_OPTIONS.find((o) => o.value === w);

                      return (
                        <div
                          key={`${wdpa.value}`}
                          className="flex mb-2.5 mr-5"
                        >
                          <span className="text-sm text-blue-400 bg-blue-400 bg-opacity-20 rounded-3xl px-2.5 h-6 inline-flex items-center mr-1">
                            {wdpa.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 z-10 w-full h-6 pointer-events-none bg-gradient-to-t from-gray-700 via-gray-700" />
          </div>

          <div className="flex justify-center mt-5 space-x-4">
            <Button theme="secondary" size="lg" type="button" className="relative px-20" disabled={submitting} onClick={onBack}>
              <span>Back</span>
            </Button>

            <Button
              theme="primary"
              size="lg"
              type="submit"
              className="relative px-20"
              disabled={submitting || readOnly}
            >
              <span>Save</span>

              <Loading
                visible={submitting}
                className="absolute top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center w-full h-full"
                iconClassName="w-5 h-5 text-white"
              />
            </Button>
          </div>
        </form>
      )}
    </FormRFF>
  );
};

export default WDPAThreshold;
