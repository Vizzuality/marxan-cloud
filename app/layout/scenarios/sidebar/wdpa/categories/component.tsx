import React, { useCallback, useState } from 'react';

import Button from 'components/button';
import Loading from 'components/loading';
import Icon from 'components/icon';
import InfoButton from 'components/info-button';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import Field from 'components/forms/field';
import Label from 'components/forms/label';
import Select from 'components/forms/select';

import {
  composeValidators,
  arrayValidator,
} from 'components/forms/validations';

import { useRouter } from 'next/router';
import { useScenario, useSaveScenario } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';
import { useProject } from 'hooks/projects';
import { useWDPACategories } from 'hooks/wdpa';

const WDPA_CATEGORIES_OPTIONS = [
  { label: 'Category 1', value: 'category-1' },
  { label: 'Category 2', value: 'category-2' },
  { label: 'Category 3', value: 'category-3' },
  { label: 'Category 4', value: 'category-4' },
  { label: 'Category 5', value: 'category-5' },
];

export interface WDPACategoriesProps {
  onSuccess: () => void
}

export const WDPACategories:React.FC<WDPACategoriesProps> = ({
  onSuccess,
}: WDPACategoriesProps) => {
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToasts();
  const { query } = useRouter();
  const { pid, sid } = query;

  const { data: projectData } = useProject(pid);
  const { data: scenarioData } = useScenario(sid);
  const { data: wdpaData } = useWDPACategories(
    projectData?.adminAreaLevel2Id
    || projectData?.adminAreaLevel1Id
    || projectData?.countryId,
  );

  const mutation = useSaveScenario({
    requestConfig: {
      method: 'PATCH',
    },
  });

  console.log(projectData, wdpaData);

  const onSubmit = useCallback(async (values) => {
    setSubmitting(true);

    mutation.mutate({
      id: scenarioData.id,
      data: {
        ...values,
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
  }, [mutation, addToast, scenarioData?.id, onSuccess]);

  if (!scenarioData) return null;

  return (
    <FormRFF
      onSubmit={onSubmit}
      mutators={{
        removeWDPAFilter: (args, state, utils) => {
          const [id, arr] = args;
          const i = arr.indexOf(id);

          if (i > -1) {
            arr.splice(i, 1);
          }
          utils.changeValue(state, 'wdpaFilter', () => arr);
        },
      }}
      initialValues={{
        wdpaFilter: scenarioData?.wdpaFilter || [],
      }}
    >
      {({ form, values, handleSubmit }) => (
        <form onSubmit={handleSubmit} autoComplete="off" className="relative w-full">
          {/* WDPA */}
          <div>
            <FieldRFF
              name="wdpaFilter"
              validate={composeValidators([{ presence: true }, arrayValidator])}
            >
              {(flprops) => (
                <Field id="scenario-wdpaFilter" {...flprops}>
                  <div className="flex items-center mb-3">
                    <Label theme="dark" className="mr-3 uppercase">Choose one or more protected areas categories</Label>
                    <InfoButton>
                      <span>Info about WDPA categories</span>
                    </InfoButton>
                  </div>
                  <Select
                    theme="dark"
                    size="base"
                    multiple
                    placeholder="Select..."
                    clearSelectionActive
                    clearSelectionLabel="None protected areas"
                    batchSelectionActive
                    batchSelectionLabel="All protected areas"
                    selected={values.wdpaFilter}
                    options={WDPA_CATEGORIES_OPTIONS}
                  />
                </Field>
              )}
            </FieldRFF>
          </div>

          <div className="mt-10">
            <h3 className="text-sm">Selected protected areas:</h3>

            <div className="flex flex-wrap mt-2.5">
              {values.wdpaFilter.map((w) => {
                const wdpa = WDPA_CATEGORIES_OPTIONS.find((o) => o.value === w);
                return (
                  <div
                    key={`${wdpa.value}`}
                    className="flex mb-2.5 mr-5"
                  >
                    <span className="text-sm text-blue-400 bg-blue-400 bg-opacity-20 rounded-3xl px-2.5 h-6 inline-flex items-center mr-1">
                      {wdpa.label}
                    </span>

                    <button
                      type="button"
                      className="flex items-center justify-center w-6 h-6 transition bg-transparent border border-gray-400 rounded-full hover:bg-gray-400"
                      onClick={() => {
                        form.mutators.removeWDPAFilter(wdpa.value, values.wdpaFilter);
                      }}
                    >
                      <Icon icon={CLOSE_SVG} className="w-2.5 h-2.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center mt-20">
            <Button theme="secondary-alt" size="lg" type="submit" className="relative px-20" disabled={submitting}>
              <span>Continue</span>

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

export default WDPACategories;
