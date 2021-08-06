import React, { useCallback, useMemo, useState } from 'react';

import { Form as FormRFF, FormSpy as FormSpyRFF, Field as FieldRFF } from 'react-final-form';
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
import Select from 'components/forms/select';
import Icon from 'components/icon';
import InfoButton from 'components/info-button';
import Loading from 'components/loading';

import CLOSE_SVG from 'svgs/ui/close.svg?sprite';

export interface WDPACategoriesProps {
  readOnly?: boolean;
  onSuccess: () => void,
  onDismiss: () => void,
}

export const WDPACategories:React.FC<WDPACategoriesProps> = ({
  readOnly,
  onSuccess,
  onDismiss,
}: WDPACategoriesProps) => {
  const [submitting, setSubmitting] = useState(false);
  const { query } = useRouter();
  const { pid, sid } = query;

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setWDPACategories } = scenarioSlice.actions;
  const dispatch = useDispatch();

  const { data: projectData } = useProject(pid);

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

  const { addToast } = useToasts();

  const mutation = useSaveScenario({
    requestConfig: {
      method: 'PATCH',
    },
  });

  // Constants
  const WDPA_CATEGORIES_OPTIONS = useMemo(() => {
    if (!wdpaData) return [];

    return wdpaData.map((w) => ({
      label: `IUCN ${w.iucnCategory}`,
      value: w.id,
    }));
  }, [wdpaData]);

  const INITIAL_VALUES = useMemo(() => {
    return {
      wdpaIucnCategories: scenarioData?.wdpaIucnCategories || [],
    };
  }, [scenarioData?.wdpaIucnCategories]);

  // Submit
  const onSubmit = useCallback((values) => {
    setSubmitting(true);

    mutation.mutate({
      id: scenarioData.id,
      data: {
        ...values,
        metadata: getScenarioStatusMetaData(scenarioEditingMetadata, 'protected-areas', 'protected-areas', 'protected-areas-percentage'),
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

  const onSkip = useCallback(() => {
    setSubmitting(true);

    mutation.mutate({
      id: scenarioData.id,
      data: {
        wdpaIucnCategories: null,
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
        onDismiss();
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
  }, [mutation, addToast, onDismiss, scenarioData?.id, scenarioEditingMetadata]);

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

  if (!wdpaData || !wdpaData.length) {
    return (
      <div>
        <div className="text-sm">This planning area doesn&apos;t have any protected areas associated with it. You can go directly to the features tab.</div>

        <div className="flex justify-center mt-20">
          <Button theme="secondary-alt" size="lg" type="button" className="relative px-20" onClick={onSkip}>
            <span>Continue to features</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <FormRFF
      key="wdpa-categories-scenarios-form"
      onSubmit={onSubmit}
      mutators={{
        removeWDPAFilter: (args, state, utils) => {
          const [id, arr] = args;
          const newArr = [...arr];
          const i = newArr.indexOf(id);

          if (i > -1) {
            newArr.splice(i, 1);
          }
          utils.changeValue(state, 'wdpaIucnCategories', () => newArr);
        },
      }}
      initialValues={INITIAL_VALUES}
    >
      {({ form, values, handleSubmit }) => (
        <form onSubmit={handleSubmit} autoComplete="off" className="relative flex flex-col flex-grow w-full overflow-hidden">
          <FormSpyRFF onChange={(state) => dispatch(setWDPACategories(state.values))} />

          <div className="relative flex flex-col flex-grow overflow-hidden">
            <div className="absolute top-0 left-0 z-10 w-full h-6 pointer-events-none bg-gradient-to-b from-gray-700 via-gray-700" />

            <div className="relative px-0.5 overflow-x-visible overflow-y-auto">
              <div className="py-6">
                {/* WDPA */}
                {!readOnly && (
                  <div>
                    <FieldRFF
                      name="wdpaIucnCategories"
                    >
                      {(flprops) => (
                        <Field id="scenario-wdpaIucnCategories" {...flprops}>
                          <div className="flex items-center mb-3">
                            <Label theme="dark" className="mr-3 uppercase">Choose one or more protected areas categories</Label>
                            <InfoButton>
                              <span>
                                <h4 className="font-heading text-lg mb-2.5">IUCN categrories</h4>
                                <div className="space-y-2">
                                  <p>
                                    You can select to include protected areas
                                    from any or all of the
                                    IUCN categories that exist in your planning area:
                                  </p>

                                  <ul className="pl-6 space-y-1 list-disc">
                                    <li>Ia: Strict Nature Reserve.</li>
                                    <li>Ib: Wilderness Area.</li>
                                    <li>II: National Park.</li>
                                    <li>III: Natural Monument or Feature.</li>
                                    <li>IV: Habitat/Species Management Area.</li>
                                    <li>V: Protected Landscape/Seascape.</li>
                                    <li>VI: Protected area with sustainable use of natural resources.</li> {/* eslint-disable-line*/}
                                  </ul>
                                </div>
                              </span>
                            </InfoButton>
                          </div>

                          {WDPA_CATEGORIES_OPTIONS.length === 1 && (
                            <Select
                              theme="dark"
                              size="base"
                              placeholder="Select..."
                              clearSelectionActive
                              selected={values.wdpaIucnCategories.length
                                ? values.wdpaIucnCategories[0]
                                : null}
                              options={WDPA_CATEGORIES_OPTIONS}
                              onChange={(v) => {
                                if (v) {
                                  flprops.input.onChange([v]);
                                } else {
                                  flprops.input.onChange([]);
                                }
                              }}
                            />
                          )}

                          {WDPA_CATEGORIES_OPTIONS.length > 1 && (
                            <Select
                              theme="dark"
                              size="base"
                              multiple
                              placeholder="Select..."
                              clearSelectionActive={false}
                              batchSelectionActive
                              batchSelectionLabel="All protected areas"
                              selected={values.wdpaIucnCategories}
                              options={WDPA_CATEGORIES_OPTIONS}
                              disabled={readOnly}
                            />
                          )}
                        </Field>
                      )}
                    </FieldRFF>
                  </div>
                )}

                {!!values.wdpaIucnCategories.length && (
                  <div className="mt-10">
                    <h3 className="text-sm">Selected protected areas:</h3>

                    <div className="flex flex-wrap mt-2.5">
                      {values.wdpaIucnCategories.map((w) => {
                        const wdpa = WDPA_CATEGORIES_OPTIONS.find((o) => o.value === w);

                        if (!wdpa) return null;

                        return (
                          <div
                            key={`${wdpa.value}`}
                            className="flex mb-2.5 mr-5"
                          >
                            <span className="text-sm text-blue-400 bg-blue-400 bg-opacity-20 rounded-3xl px-2.5 h-6 inline-flex items-center mr-1">
                              {wdpa.label}
                            </span>
                            {!readOnly && (
                              <button
                                type="button"
                                className="flex items-center justify-center w-6 h-6 transition bg-transparent border border-gray-400 rounded-full hover:bg-gray-400"
                                onClick={() => {
                                  form.mutators.removeWDPAFilter(
                                    wdpa.value,
                                    values.wdpaIucnCategories,
                                  );
                                }}
                              >
                                <Icon icon={CLOSE_SVG} className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="absolute bottom-0 left-0 z-10 w-full h-6 pointer-events-none bg-gradient-to-t from-gray-700 via-gray-700" />
          </div>

          <div className="flex justify-center mt-5 space-x-2">
            <Button
              theme="secondary-alt"
              size="lg"
              type={values.wdpaIucnCategories.length ? 'submit' : 'button'}
              className="relative px-20"
              disabled={submitting}
              onClick={!values.wdpaIucnCategories.length ? onSkip : null}
            >
              {!!values.wdpaIucnCategories.length && (
                <span>Continue</span>
              )}

              {!values.wdpaIucnCategories.length && (
                <span>Skip to features</span>
              )}

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
