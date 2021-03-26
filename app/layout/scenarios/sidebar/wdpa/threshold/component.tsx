import React, { useCallback, useState } from 'react';

import Button from 'components/button';
import Loading from 'components/loading';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import Field from 'components/forms/field';
import Label from 'components/forms/label';
import Slider from 'components/forms/slider';

import {
  composeValidators,
} from 'components/forms/validations';

import { useRouter } from 'next/router';
import { useScenario, useSaveScenario } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';

const WDPA_CATEGORIES_OPTIONS = [
  { label: 'Category 1', value: 'category-1' },
  { label: 'Category 2', value: 'category-2' },
  { label: 'Category 3', value: 'category-3' },
  { label: 'Category 4', value: 'category-4' },
  { label: 'Category 5', value: 'category-5' },
];

export interface WDPAThresholdCategories {
  onSuccess: () => void;
  onBack: () => void;
}

export const WDPAThreshold: React.FC<WDPAThresholdCategories> = ({
  onSuccess,
  onBack,
}: WDPAThresholdCategories) => {
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToasts();
  const { query } = useRouter();
  const { sid } = query;

  const { data } = useScenario(sid);

  const mutation = useSaveScenario({
    requestConfig: {
      method: 'PATCH',
    },
  });

  const labelRef = React.useRef(null);

  const onSubmit = useCallback(async (values) => {
    setSubmitting(true);

    const { wdpaThreshold } = values;

    mutation.mutate({
      id: data.id,
      data: {
        wdpaThreshold: +(wdpaThreshold * 100).toFixed(0),
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
  }, [mutation, addToast, data?.id, onSuccess]);

  if (!data) return null;

  const {
    wdpaFilter = [],
    wdpaThreshold,
  } = data;

  return (
    <FormRFF
      onSubmit={onSubmit}
      initialValues={{
        wdpaThreshold: wdpaThreshold ? wdpaThreshold / 100 : 0.75,
      }}
    >
      {({ values, handleSubmit }) => (
        <form onSubmit={handleSubmit} autoComplete="off" className="relative w-full">
          {/* WDPA */}
          <div>
            <FieldRFF
              name="wdpaThreshold"
              validate={composeValidators([{ presence: true }])}
            >
              {(flprops) => (
                <Field id="scenario-wdpaThreshold" {...flprops}>
                  <Label ref={labelRef} theme="dark" className="mb-3 uppercase">Set the threshold for protected areas</Label>

                  <p
                    className="mb-3 text-sm text-gray-400"
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
                    minValue={0}
                    step={0.01}
                  />
                </Field>
              )}
            </FieldRFF>
          </div>

          <div className="mt-10">
            <h3 className="text-sm">Selected protected areas:</h3>

            <div className="flex flex-wrap mt-2.5">
              {wdpaFilter && wdpaFilter.map((w) => {
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

          <div className="flex justify-center gap-4 mt-20">
            <Button theme="secondary" size="lg" type="button" className="relative px-20" disabled={submitting} onClick={onBack}>
              <span>Back</span>
            </Button>

            <Button theme="primary" size="lg" type="submit" className="relative px-20" disabled={submitting}>
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
