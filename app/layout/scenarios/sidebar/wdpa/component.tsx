import React, { useCallback, useState } from 'react';

import Pill from 'layout/pill';

import Button from 'components/button';
import Loading from 'components/loading';

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

export interface ScenariosSidebarWDPAProps {
}

export const ScenariosSidebarWDPA: React.FC<ScenariosSidebarWDPAProps> = () => {
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToasts();
  const { query } = useRouter();
  const { pid, sid } = query;

  const WDPA_CATEGORIES_OPTIONS = [
    { label: 'Category 1', value: 'category-1' },
    { label: 'Category 2', value: 'category-2' },
    { label: 'Category 3', value: 'category-3' },
    { label: 'Category 4', value: 'category-4' },
    { label: 'Category 5', value: 'category-5' },
  ];

  const { data } = useScenario(sid);

  const mutation = useSaveScenario({
    requestConfig: {
      method: 'PATCH',
      url: `/${sid}`,
    },
  });

  const handleSubmit = useCallback(async (values) => {
    setSubmitting(true);

    mutation.mutate({
      ...values,
      type: 'marxan',
      projectId: pid,
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
      },
      onError: () => {
        setSubmitting(false);

        addToast('error-scenario-wdpa', (
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">Scenario WDPA saved not saved</p>
          </>
        ), {
          level: 'error',
        });
      },
    });
  }, [mutation, pid, addToast]);

  if (!data) return null;

  return (
    <Pill>
      <FormRFF
        onSubmit={handleSubmit}
        initialValues={{
          wdpaFilter: data?.wdpaFilter,
        }}
      >
        {(props) => (
          <form onSubmit={props.handleSubmit} autoComplete="off" className="relative w-full">
            <h2 className="mb-5 text-lg font-medium font-heading">Protected areas</h2>
            {/* WDPA */}
            <div>
              <FieldRFF
                name="wdpaFilter"
                validate={composeValidators([{ presence: true }, arrayValidator])}
              >
                {(fprops) => (
                  <Field id="scenario-wdpaFilter" {...fprops}>
                    <Label theme="dark" className="mb-3 uppercase">Choose one or more protected areas categories</Label>
                    <Select
                      theme="dark"
                      size="base"
                      multiple
                      placeholder="Select..."
                      clearSelectionActive
                      clearSelectionLabel="None protected areas"
                      batchSelectionActive
                      batchSelectionLabel="All protected areas"
                      initialSelected={data?.wdpaFilter}
                      initialValues={data?.wdpaFilter}
                      options={WDPA_CATEGORIES_OPTIONS}
                    />
                  </Field>
                )}
              </FieldRFF>
            </div>

            <div className="flex justify-center mt-5">
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
    </Pill>
  );
};

export default ScenariosSidebarWDPA;
