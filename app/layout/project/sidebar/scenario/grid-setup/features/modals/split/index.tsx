import React, { useCallback, useRef, useState } from 'react';

import { Form as FormRFF, Field as FieldRFF, FormProps } from 'react-final-form';
import { QueryClient, useQueryClient } from 'react-query';

import { useRouter } from 'next/router';

import { useProjectFeatures, useSelectedFeatures } from 'hooks/features';
import { useSaveSelectedFeatures } from 'hooks/features';

import Button from 'components/button';
import Checkbox from 'components/forms/checkbox';
import Field from 'components/forms/field';
import Label from 'components/forms/label';
import Select from 'components/forms/select';
import { Feature } from 'types/api/feature';

export type FormValues = {
  featureClassName: Feature['featureClassName'];
  splitOption: string[] | null;
};

type SplitOptions = {
  label: string;
  key: string;
  values: { name: string; value: string }[];
};

const SplitModal = ({
  featureId,
  handleModal,
}: {
  featureId: Feature['id'];
  handleModal: (modalKey: 'edit' | 'split', isVisible: boolean) => void;
  onSplitFeature?: (featureId: Feature['id']) => void;
}): JSX.Element => {
  const queryClient = useQueryClient();
  const { query } = useRouter();
  const { pid, sid } = query as { pid: string; sid: string };

  const formRef = useRef<FormProps<FormValues>['form']>(null);

  const [splitFeaturesSelected, setSplitFeaturesSelected] = useState<{ id: string }[]>([]);

  const featureQuery = useProjectFeatures(pid, featureId);
  const selectedFeaturesQuery = useSelectedFeatures(sid, {});
  const selectedFeaturesMutation = useSaveSelectedFeatures({});

  const featureSplitOptions: SplitOptions[] = selectedFeaturesQuery.data?.find(
    (feature) => feature.id === featureId
  )?.splitOptions;

  const SPLIT_OPTIONS = featureSplitOptions?.map((splitOption) => ({
    label: splitOption.label,
    value: splitOption.key,
  }));

  const getSplitOptionValues = useCallback(
    (opt) => {
      return featureSplitOptions.find((splitOption) => splitOption.key === opt)?.values;
    },
    [featureSplitOptions]
  );

  const onSplitFeaturesChanged = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newSplitFeaturesSelected = [...splitFeaturesSelected];
      const index = newSplitFeaturesSelected.findIndex(
        (s) => `${s.id}` === `${e.currentTarget.value}`
      );

      if (index > -1) {
        newSplitFeaturesSelected.splice(index, 1);
      } else {
        newSplitFeaturesSelected.push({
          id: e.currentTarget.value,
        });
      }

      setSplitFeaturesSelected(newSplitFeaturesSelected);
    },
    [splitFeaturesSelected]
  );

  const onSplitSubmit = useCallback(
    (values) => {
      const { splitOption } = values;

      selectedFeaturesMutation.mutate(
        {
          id: `${sid}`,
          data: {
            status: 'draft',
            features: selectedFeaturesQuery.data.map((sf) => {
              if (sf.id === featureId) {
                return {
                  featureId: sf.id,
                  kind: 'withGeoprocessing',
                  geoprocessingOperations: [
                    {
                      kind: 'split/v1',
                      splitByProperty: splitOption,
                      splits: splitFeaturesSelected.map((fts) => {
                        return {
                          value: fts.id,
                          marxanSettings: {
                            fpf: 1,
                            prop: 0.5,
                          },
                        };
                      }),
                    },
                  ],
                };
              }
              if (sf.id !== featureId) {
                const {
                  metadata,
                  id,
                  name,
                  description,
                  amountRange,
                  color,
                  splitOptions,
                  splitSelected,
                  splitFeaturesSelected,
                  splitFeaturesOptions,
                  intersectFeaturesSelected,
                  ...sfRest
                } = sf;
                return sfRest;
              }
            }),
          },
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries(['selected-features', sid]);
            handleModal('split', false);
          },
          onError: () => {},
        }
      );
    },
    [sid, selectedFeaturesMutation, selectedFeaturesQuery.data, splitFeaturesSelected, handleModal]
  );

  return (
    <FormRFF<FormValues>
      initialValues={{
        featureClassName: featureQuery.data?.[0]?.featureClassName,
        splitOption: null,
      }}
      ref={formRef}
      onSubmit={onSplitSubmit}
      render={({ form, handleSubmit, values }) => {
        formRef.current = form;

        return (
          <form onSubmit={handleSubmit} className="relative text-gray-900">
            <div className="flex flex-col space-y-8 px-8 py-1">
              <h2 className="font-heading font-bold">Split feature</h2>

              <div>
                <Label theme="light" className="mb-3 text-xs font-semibold uppercase">
                  Feature Name
                </Label>

                <p>{featureQuery.data?.[0]?.featureClassName}</p>
              </div>

              <div>
                <FieldRFF<string> name="splitOption">
                  {(fprops) => (
                    <Field id="splitOption" {...fprops} className="relative">
                      <Label
                        theme="light"
                        className="mb-3 font-heading text-xs font-semibold uppercase"
                      >
                        You can split this feature into categories
                      </Label>

                      <div className="space-y-2">
                        <Select
                          theme="light"
                          size="base"
                          placeholder="Select..."
                          clearSelectionActive
                          clearSelectionLabel="Clear selection"
                          selected={values.splitOption}
                          options={SPLIT_OPTIONS}
                          onChange={fprops.input.onChange}
                        />
                      </div>
                    </Field>
                  )}
                </FieldRFF>
              </div>

              <div>
                <FieldRFF<string> name="splitValues">
                  {(fprops) => (
                    <Field id="splitValues" {...fprops} className="relative">
                      <div className="space-y-2">
                        {getSplitOptionValues(values.splitOption)?.map((value) => (
                          <div key={value.name} className="flex items-center space-x-2.5">
                            <Checkbox
                              id={`checkbox-${value.name}`}
                              value={`${value.name}`}
                              theme="light"
                              className="h-4 w-4"
                              onChange={onSplitFeaturesChanged}
                            />
                            <label
                              htmlFor={`checkbox-${value.name}`}
                              className="ml-2.5 inline-block max-w-sm text-xs"
                            >
                              {value.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </Field>
                  )}
                </FieldRFF>
              </div>

              <div className="mt-16 flex justify-center space-x-6">
                <Button theme="secondary" size="xl" onClick={() => handleModal('edit', false)}>
                  Cancel
                </Button>

                <Button theme="primary" size="xl" type="submit">
                  Save
                </Button>
              </div>
            </div>
          </form>
        );
      }}
    />
  );
};

export default SplitModal;
