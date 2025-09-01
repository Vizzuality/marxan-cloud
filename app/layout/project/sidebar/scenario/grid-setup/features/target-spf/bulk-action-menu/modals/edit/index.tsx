import React, { useCallback, useRef, useMemo } from 'react';

import { Form as FormRFF, Field as FieldRFF, FormProps } from 'react-final-form';

import { useRouter } from 'next/router';

import { useSaveSelectedFeatures, useSelectedFeatures } from 'hooks/features';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import Field from 'components/forms/field';
import Label from 'components/forms/label';
import Radio from 'components/forms/radio';
import { composeValidators } from 'components/forms/validations';
import { Feature } from 'types/api/feature';

export type FormValues = {
  target: number;
  spf: number;
  mode: 'all' | 'only-target' | 'only-spf';
};

const EDITION_MODES = [
  { value: 'all', label: 'Target & SPF' },
  { value: 'only-target', label: 'Target' },
  { value: 'only-spf', label: 'SPF' },
];

const INPUT_CLASSES =
  'h-10 w-full rounded-md border border-gray-400 px-3 text-gray-900 focus:border-none focus:outline-none focus:ring-1 focus:ring-blue-600';

const EditModal = ({
  selectedFeatures,
  handleModal,
  onDone,
}: {
  selectedFeatures: (Feature & { name: string; marxanSettings: { prop?: number; fpf?: number } })[];
  handleModal: (modalKey: 'split' | 'edit' | 'delete', isVisible: boolean) => void;
  onDone?: (res?: unknown) => void;
}): JSX.Element => {
  const { addToast } = useToasts();
  const { query } = useRouter();
  const { sid } = query as { pid: string; sid: string };

  const formRef = useRef<FormProps<FormValues>['form']>(null);
  const selectedFeaturesMutation = useSaveSelectedFeatures({});

  const selectedFeaturesQuery = useSelectedFeatures(
    sid,
    {},
    {
      keepPreviousData: true,
    }
  );

  const targetedFeatures = useMemo(() => {
    let parsedData = [];
    const formState = formRef.current?.getState();

    if (!formState?.values) return [];

    selectedFeaturesQuery.data?.forEach((feature) => {
      if (feature.splitFeaturesSelected?.length > 0) {
        const splitFeatures = feature.splitFeaturesSelected.map((splitFeature) => ({
          ...splitFeature,
          id: `${feature.id}-${splitFeature.name}`,
          parentId: feature.id,
        }));

        parsedData = [...parsedData, ...splitFeatures];
      } else {
        parsedData = [
          ...parsedData,
          {
            ...feature,
          },
        ];
      }
    });

    return parsedData;
  }, [selectedFeaturesQuery.data, formRef]);

  const onEditSubmit = useCallback(
    (values: FormValues) => {
      const { target, spf = 1, mode } = values;

      const data = {
        status: 'created',
        features: selectedFeaturesQuery.data.map((sf) => {
          const { featureId, kind, geoprocessingOperations } = sf;

          if (kind === 'withGeoprocessing') {
            return {
              featureId,
              kind,
              geoprocessingOperations: geoprocessingOperations.map((go) => {
                const { splits } = go;

                return {
                  ...go,
                  splits: splits
                    .filter((s) => {
                      return targetedFeatures.find((f) => {
                        return f.parentId === featureId && f.value === s.value;
                      });
                    })
                    .map((s) => {
                      const {
                        marxanSettings: { prop, fpf },
                      } = targetedFeatures.find((f) => {
                        return f.parentId === featureId && f.value === s.value;
                      });

                      return {
                        ...s,
                        marxanSettings: {
                          prop: prop / 100,
                          fpf,
                        },
                      };
                    }),
                };
              }),
            };
          }

          let newMarxanSettings = sf.marxanSettings;

          if (mode === 'only-target') {
            newMarxanSettings = {
              ...newMarxanSettings,
              prop: target / 100,
            };
          }

          if (mode === 'only-spf') {
            newMarxanSettings = {
              ...newMarxanSettings,
              fpf: +spf,
            };
          }

          if (mode === 'all') {
            newMarxanSettings = {
              prop: target / 100,
              fpf: +spf,
            };
          }

          return {
            featureId,
            kind,
            marxanSettings: selectedFeatures.find((f) => f.id === featureId)
              ? newMarxanSettings
              : sf.marxanSettings,
          };
        }),
      };

      selectedFeaturesMutation.mutate(
        {
          id: sid,
          data,
        },
        {
          onSuccess: (res) => {
            onDone?.(res);
            handleModal('edit', false);

            addToast(
              'success-edit-features',
              <>
                <h2 className="font-medium">Success!</h2>
                <p className="text-sm">Features edited</p>
              </>,
              {
                level: 'success',
              }
            );
          },
          onError: () => {
            addToast(
              'error-edit-features',
              <>
                <h2 className="font-medium">Error!</h2>
                <p className="text-sm">It is not possible to edit this feature</p>
              </>,
              {
                level: 'error',
              }
            );
          },
        }
      );
    },
    [
      addToast,
      selectedFeaturesQuery.data,
      targetedFeatures,
      selectedFeatures,
      selectedFeaturesMutation,
      handleModal,
      sid,
      onDone,
    ]
  );

  return (
    <FormRFF<FormValues>
      initialValues={{
        mode: 'all',
        target:
          (selectedFeatures?.length === 1 && selectedFeatures?.[0]?.marxanSettings?.prop) ||
          undefined,
        spf:
          (selectedFeatures?.length === 1 && selectedFeatures?.[0]?.marxanSettings?.fpf) ||
          undefined,
      }}
      onSubmit={onEditSubmit}
      render={({ form, handleSubmit }) => {
        formRef.current = form;

        const currentMode = form?.getState()?.values?.mode;

        return (
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex flex-col space-y-5 px-8 py-1">
              <h2 className="font-heading font-bold text-black">Edit selected features</h2>

              <div className="flex space-x-2">
                {EDITION_MODES.map(({ value, label }) => {
                  return (
                    <FieldRFF key={value} name="mode" type="radio" value={value}>
                      {(fprops) => (
                        <div className="flex space-x-2">
                          <Radio theme="light" id={value} {...fprops.input} />
                          <Label theme="light" id={value} className="ml-2">
                            {label}
                          </Label>
                        </div>
                      )}
                    </FieldRFF>
                  );
                })}
              </div>

              <div className="flex w-full space-x-2">
                {['only-target', 'all'].includes(currentMode) && (
                  <FieldRFF<FormValues['target']>
                    name="target"
                    validate={composeValidators([{ presence: true }])}
                  >
                    {(fprops) => (
                      <Field id="target" {...fprops} className="flex-1">
                        <Label theme="light" className="mb-3 text-xs font-semibold uppercase">
                          Target (%)
                        </Label>

                        <input
                          {...fprops.input}
                          type="number"
                          className={INPUT_CLASSES}
                          defaultValue={fprops.input.value}
                          min={0}
                          max={100}
                          step={0.01}
                        />
                      </Field>
                    )}
                  </FieldRFF>
                )}
                {['only-spf', 'all'].includes(currentMode) && (
                  <FieldRFF<FormValues['spf']>
                    name="spf"
                    validate={composeValidators([{ presence: true }])}
                  >
                    {(fprops) => (
                      <Field id="spf" {...fprops} className="flex-1">
                        <Label theme="light" className="mb-3 text-xs font-semibold uppercase">
                          SPF
                        </Label>

                        <input
                          {...fprops.input}
                          type="number"
                          className={INPUT_CLASSES}
                          defaultValue={fprops.input.value}
                          min={1}
                          step={0.01}
                        />
                      </Field>
                    )}
                  </FieldRFF>
                )}
              </div>

              <div className="mt-16 flex justify-center space-x-6">
                <Button theme="secondary" size="xl" onClick={() => handleModal('edit', false)}>
                  Cancel
                </Button>

                <Button
                  theme="primary"
                  size="xl"
                  type="submit"
                  disabled={formRef.current?.getState().invalid}
                >
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

export default EditModal;
