import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import { useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import intersection from 'lodash/intersection';
import isEqual from 'lodash/isEqual';

import { useCanEditScenario } from 'hooks/permissions';
import { useProject } from 'hooks/projects';
import { useScenario } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';
import { useWDPACategories, useSaveScenarioProtectedAreas } from 'hooks/wdpa';

import Button from 'components/button';
import Field from 'components/forms/field';
import Label from 'components/forms/label';
import Select from 'components/forms/select';
import InfoButton from 'components/info-button';
import Loading from 'components/loading';
import Section from 'layout/section';

import ProtectedAreasSelected from '../pa-selected';

import ProtectedAreaUploader from './pa-uploader';

export const WDPACategories = ({ onContinue }): JSX.Element => {
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToasts();
  const formRef = useRef(null);

  const { push, query } = useRouter();
  const { pid, sid } = query as { pid: string; sid: string };

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setWDPACategories, setWDPAThreshold } = scenarioSlice.actions;
  const dispatch = useDispatch();

  const editable = useCanEditScenario(pid, sid);
  const { data: projectData } = useProject(pid);

  const {
    data: scenarioData,
    isFetching: scenarioIsFetching,
    isFetched: scenarioIsFetched,
  } = useScenario(sid);

  const {
    data: wdpaData,
    isFetching: wdpaIsFetching,
    isFetched: wdpaIsFetched,
  } = useWDPACategories({
    adminAreaId:
      projectData?.adminAreaLevel2Id || projectData?.adminAreaLevel1I || projectData?.countryId,
    customAreaId:
      !projectData?.adminAreaLevel2Id && !projectData?.adminAreaLevel1I && !projectData?.countryId
        ? projectData?.planningAreaId
        : null,
    scenarioId: sid,
  });

  const saveScenarioProtectedAreasMutation = useSaveScenarioProtectedAreas({
    requestConfig: {
      method: 'POST',
    },
  });

  const onCalculateProtectedAreas = useCallback(
    (values) => {
      setSubmitting(true);
      const { wdpaIucnCategories } = values;

      const selectedProtectedAreas = wdpaData
        ?.filter((pa) => wdpaIucnCategories?.includes(pa.id))
        .map((pa) => {
          return {
            id: pa.id,
            selected: true,
          };
        });

      saveScenarioProtectedAreasMutation.mutate(
        {
          id: `${sid}`,
          data: {
            areas: selectedProtectedAreas,
            threshold: scenarioData?.wdpaThreshold ? scenarioData.wdpaThreshold : 75,
          },
        },
        {
          onSuccess: () => {
            setSubmitting(false);
            addToast(
              'save-scenario-wdpa',
              <>
                <h2 className="font-medium">Success!</h2>
                <p className="text-sm">Scenario protected areas saved</p>
              </>,
              {
                level: 'success',
              }
            );
            // push(`/projects/${pid}/scenarios/${sid}/edit?tab=${TABS['scenario-protected-areas']}`);
            onContinue();
          },
          onError: () => {
            setSubmitting(false);

            addToast(
              'error-scenario-wdpa',
              <>
                <h2 className="font-medium">Error!</h2>
                <p className="text-sm">Scenario protected areas not saved</p>
              </>,
              {
                level: 'error',
              }
            );
          },
        }
      );
    },
    [saveScenarioProtectedAreasMutation, sid, wdpaData, scenarioData, addToast, onContinue]
  );

  const onSubmit = useCallback(
    (values) => {
      const wdpaSelected = wdpaData.filter((w) => !!w.selected).map((w) => w.id);
      const isModified = !isEqual(wdpaSelected, values.wdpaIucnCategories);

      if (isModified) {
        onCalculateProtectedAreas(values);
      } else {
        // push(`/projects/${pid}/scenarios/${sid}/edit?tab=${TABS['scenario-protected-areas']}`);
        onContinue();
      }
    },
    [wdpaData, onCalculateProtectedAreas, pid, sid, push, onContinue]
  );

  // Constants
  const WDPA_CATEGORIES_OPTIONS = useMemo(() => {
    if (!wdpaData) return [];

    return wdpaData.map((w) => ({
      label: w.kind === 'global' ? `IUCN ${w.name}` : `${w.name}`,
      value: w.id,
      kind: w.kind,
      selected: w.selected,
    }));
  }, [wdpaData]);

  const PROJECT_PA_OPTIONS = WDPA_CATEGORIES_OPTIONS.filter((w) => w.kind === 'project');
  const WDPA_OPTIONS = WDPA_CATEGORIES_OPTIONS.filter((w) => w.kind === 'global');

  const ORDERED_WDPA_CATEGORIES_OPTIONS = useMemo(() => {
    if (!wdpaData) return [];

    return PROJECT_PA_OPTIONS.concat(WDPA_OPTIONS);
  }, [wdpaData, WDPA_OPTIONS, PROJECT_PA_OPTIONS]);

  const INITIAL_VALUES = useMemo(() => {
    const selectedAreas = wdpaData?.filter((pa) => pa.selected) || [];
    const areas = selectedAreas.map((i) => i.id) || [];

    return {
      wdpaIucnCategories: areas,
    };
  }, [wdpaData]);

  useEffect(() => {
    if (scenarioData?.wdpaThreshold) {
      dispatch(setWDPAThreshold(scenarioData.wdpaThreshold / 100));
    }
  }, [scenarioData?.wdpaThreshold]); //eslint-disable-line

  useEffect(() => {
    dispatch(setWDPACategories(INITIAL_VALUES));
    // We need to setWDPACategories' initial values on first render only.
    // The way to pull this off is to add no dependencies to useEffect, but
    // eslint will complain about it. So we disable this check.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Loading
  if ((scenarioIsFetching && !scenarioIsFetched) || (wdpaIsFetching && !wdpaIsFetched)) {
    return (
      <Loading
        visible
        className="relative flex h-16 w-full items-center justify-center"
        iconClassName="w-10 h-10 text-white"
      />
    );
  }

  return (
    <Section>
      <div className="space-y-1">
        <span className="text-xs font-semibold text-blue-400">Grid Setup</span>
        <h3 className="flex items-center space-x-2">
          <span className="text-lg font-medium">Protected Areas</span>
        </h3>
      </div>
      <FormRFF
        onSubmit={onSubmit}
        key="protected-areas-categories"
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
        {({ form, values, handleSubmit }) => {
          formRef.current = form;

          const { values: stateValues } = formRef?.current?.getState();

          dispatch(setWDPACategories(stateValues));

          const plainWDPAOptions = WDPA_OPTIONS.map((o) => o.value);
          const plainProjectPAOptions = PROJECT_PA_OPTIONS.map((o) => o.value);

          const areWDPAreasSelected =
            intersection(plainWDPAOptions, values.wdpaIucnCategories).length > 0;

          const areProjectPAreasSelected =
            intersection(plainProjectPAOptions, values.wdpaIucnCategories).length > 0;

          return (
            <form
              onSubmit={handleSubmit}
              autoComplete="off"
              className="relative flex w-full flex-grow flex-col overflow-hidden"
            >
              <Loading
                visible={submitting}
                className="absolute bottom-0 left-0 right-0 top-0 z-40 flex h-full w-full items-center justify-center bg-gray-700 bg-opacity-90"
                iconClassName="w-10 h-10 text-white"
              />

              <div className="relative flex flex-grow flex-col overflow-hidden">
                <div className="relative overflow-y-auto overflow-x-visible px-0.5">
                  <div className="py-6">
                    {/* WDPA */}

                    <div>
                      <FieldRFF name="wdpaIucnCategories">
                        {(fprops) => (
                          <Field id="wdpaIucnCategories" {...fprops}>
                            <div className="mb-3 flex items-center">
                              <Label theme="dark" className="mr-3 uppercase">
                                Choose one or more protected areas categories
                              </Label>
                              <InfoButton>
                                <span>
                                  <h4 className="mb-2.5 font-heading text-lg">IUCN categories</h4>
                                  <div className="space-y-2">
                                    <p>
                                      You can select to include protected areas from any or all of
                                      the IUCN categories that exist in your planning area:
                                    </p>

                                    <ul className="list-disc space-y-1 pl-6">
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

                            {WDPA_CATEGORIES_OPTIONS.length < 1 && (
                              <div className="py-6 text-sm">
                                This planning area doesn&apos;t have any protected areas categories
                                associated with it. You can upload a new one using the button below.
                              </div>
                            )}

                            {WDPA_CATEGORIES_OPTIONS.length === 1 && (
                              <Select
                                theme="dark"
                                size="base"
                                placeholder="Select..."
                                clearSelectionActive
                                disabled={!editable}
                                selected={
                                  values.wdpaIucnCategories.length
                                    ? values.wdpaIucnCategories[0]
                                    : null
                                }
                                options={ORDERED_WDPA_CATEGORIES_OPTIONS}
                                onChange={(v) => {
                                  if (v) {
                                    fprops.input.onChange([v]);
                                  } else {
                                    fprops.input.onChange([]);
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
                                clearSelectionActive
                                clearSelectionLabel="Clear selection"
                                batchSelectionActive
                                batchSelectionLabel="All protected areas"
                                disabled={!editable}
                                selected={values.wdpaIucnCategories}
                                options={ORDERED_WDPA_CATEGORIES_OPTIONS}
                                onChange={fprops.input.onChange}
                              />
                            )}
                          </Field>
                        )}
                      </FieldRFF>
                    </div>

                    {WDPA_CATEGORIES_OPTIONS.length > 1 && (
                      <p className="py-4 text-center text-sm">or</p>
                    )}

                    <FieldRFF name="uploadedProtectedArea">
                      {(flprops) => {
                        return <ProtectedAreaUploader {...flprops} />;
                      }}
                    </FieldRFF>

                    {areWDPAreasSelected && (
                      <ProtectedAreasSelected
                        form={form}
                        options={WDPA_OPTIONS}
                        title="Selected protected areas:"
                        wdpaIucnCategories={values.wdpaIucnCategories}
                      />
                    )}

                    {areProjectPAreasSelected && (
                      <ProtectedAreasSelected
                        form={form}
                        options={PROJECT_PA_OPTIONS}
                        title="Uploaded protected areas:"
                        wdpaIucnCategories={values.wdpaIucnCategories}
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-4 text-xs text-white">
                <p className="leading-relaxed opacity-50">
                  UNEP-WCMC and IUCN (2022), Protected Planet: The World Database on Protected Areas
                  (WDPA) [On-line], [05/2022], Cambridge, UK: UNEP-WCMC and IUCN.
                </p>
                <p>
                  Available at:{' '}
                  <a
                    className="text-primary-500"
                    href="www.protectedplanet.net"
                    rel="noreferrer"
                    target="_blank"
                  >
                    www.protectedplanet.net.
                  </a>
                </p>
              </div>

              <div className="mt-5 flex justify-center space-x-2">
                <Button theme="secondary-alt" size="lg" type="submit" className="relative px-20">
                  Continue
                </Button>
              </div>
            </form>
          );
        }}
      </FormRFF>
    </Section>
  );
};

export default WDPACategories;