import React, { useCallback, useMemo, useState, useEffect } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import { useDispatch, useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { useCanEditScenario } from 'hooks/permissions';
import { useProject } from 'hooks/projects';
import { useScenario } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';
import { useWDPACategories, useSaveScenarioProtectedAreas } from 'hooks/wdpa';

import Button from 'components/button';
import Field from 'components/forms/field';
import Label from 'components/forms/label';
import Slider from 'components/forms/slider';
import { composeValidators } from 'components/forms/validations';
import InfoButton from 'components/info-button';
import Loading from 'components/loading';
import { TABS } from 'layout/project/navigation/constants';
import ProtectedAreasSelected from 'layout/scenarios/edit/planning-unit/protected-areas/pa-selected';
import Section from 'layout/section';

import THRESHOLD_IMG from 'images/info-buttons/img_threshold.png';

export const WDPAThreshold = ({ onGoBack }): JSX.Element => {
  const [submitting, setSubmitting] = useState(false);

  const { addToast } = useToasts();
  const { push, query } = useRouter();
  const { pid, sid } = query as { pid: string; sid: string };

  const { wdpaCategories } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setWDPAThreshold } = scenarioSlice.actions;
  const dispatch = useDispatch();

  const { data: projectData } = useProject(pid);
  const editable = useCanEditScenario(pid, sid);
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

  const labelRef = React.useRef(null);

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
  const GLOBAL_PA_OPTIONS = WDPA_CATEGORIES_OPTIONS.filter((w) => w.kind === 'global');

  const selectedProtectedAreas = useMemo(() => {
    if (wdpaData && Array.isArray(wdpaData)) {
      return wdpaData
        .filter((pa) => pa.selected)
        .map((pa) => {
          return {
            id: pa.id,
            selected: true,
          };
        });
    }

    return [];
  }, [wdpaData]);

  const INITIAL_VALUES = useMemo(() => {
    return {
      wdpaThreshold: scenarioData?.wdpaThreshold ? scenarioData.wdpaThreshold / 100 : 0.75,
      wdpaIucnCategories: scenarioData?.wdpaIucnCategories || [],
    };
  }, [scenarioData]);

  const globalPAreasSelectedIds = useMemo(() => {
    const { wdpaIucnCategories } = wdpaCategories;
    return GLOBAL_PA_OPTIONS.map((p) => p.value).filter((p) => wdpaIucnCategories?.includes(p));
  }, [wdpaCategories, GLOBAL_PA_OPTIONS]);

  const projectPAreasSelectedIds = useMemo(() => {
    const { wdpaIucnCategories } = wdpaCategories;
    return PROJECT_PA_OPTIONS.map((p) => p.value).filter((p) => wdpaIucnCategories?.includes(p));
  }, [wdpaCategories, PROJECT_PA_OPTIONS]);

  const areGlobalPAreasSelected = !!globalPAreasSelectedIds.length;
  const areProjectPAreasSelected = !!projectPAreasSelectedIds.length;

  useEffect(() => {
    dispatch(
      setWDPAThreshold(scenarioData?.wdpaThreshold ? scenarioData.wdpaThreshold / 100 : 0.75)
    );
  }, [scenarioData]); //eslint-disable-line

  const handleSubmit = useCallback(
    (values) => {
      setSubmitting(true);

      const { wdpaThreshold } = values;

      saveScenarioProtectedAreasMutation.mutate(
        {
          id: `${sid}`,
          data: {
            areas: selectedProtectedAreas,
            threshold: +(wdpaThreshold * 100).toFixed(0),
          },
        },
        {
          onSuccess: () => {
            setSubmitting(false);
            addToast(
              'save-scenario-wdpa',
              <>
                <h2 className="font-medium">Success!</h2>
                <p className="text-sm">Scenario protected areas threshold saved</p>
              </>,
              {
                level: 'success',
              }
            );
            push(`/projects/${pid}/scenarios/${sid}/edit?tab=${TABS['scenario-cost-surface']}`);
          },
          onError: () => {
            setSubmitting(false);

            addToast(
              'error-scenario-wdpa',
              <>
                <h2 className="font-medium">Error!</h2>
                <p className="text-sm">Scenario protected areas threshold not saved</p>
              </>,
              {
                level: 'error',
              }
            );
          },
        }
      );
    },
    [saveScenarioProtectedAreasMutation, selectedProtectedAreas, sid, addToast]
  );

  // const handleBack = useCallback(() => {
  //   push(`/projects/${pid}/scenarios/${sid}/edit?tab=protected-areas`);
  // }, [push, pid, sid]);

  // Loading
  if (
    (!!scenarioData && scenarioIsFetching && !scenarioIsFetched) ||
    (!!wdpaData && wdpaIsFetching && !wdpaIsFetched)
  ) {
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
          <span className="text-lg font-medium">Protected Areas Treshold</span>
        </h3>
      </div>
      <FormRFF onSubmit={handleSubmit} initialValues={INITIAL_VALUES}>
        {({ values, handleSubmit: RFFhandleSubmit }) => (
          <form
            onSubmit={RFFhandleSubmit}
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
                    <FieldRFF
                      name="wdpaThreshold"
                      validate={composeValidators([{ presence: true }])}
                    >
                      {(flprops) => (
                        <Field id="scenario-wdpaThreshold" {...flprops}>
                          <div className="mb-3 flex items-center">
                            <Label ref={labelRef} theme="dark" className="mr-3 uppercase">
                              Set the threshold for protected areas
                            </Label>
                            <InfoButton>
                              <div>
                                <h4 className="mb-2.5 font-heading text-lg">
                                  Threshold for Protected Areas
                                </h4>
                                <div className="space-y-2">
                                  <p>
                                    Refers to what percentage of a planning unit must be covered by
                                    a protected area to be considered &quot;protected&quot; by
                                    Marxan.
                                  </p>
                                  <p>
                                    The following image shows an example setting a threshold of 50%:
                                  </p>
                                </div>

                                <img src={THRESHOLD_IMG} alt="Threshold" />
                              </div>
                            </InfoButton>
                          </div>

                          <p className="mb-3 text-sm text-gray-300">
                            Refers to what percentage of a planning unit must be covered by a
                            protected area to be considered “protected”.
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
                            disabled={!editable}
                            onChange={(s) => {
                              flprops.input.onChange(s);
                              dispatch(setWDPAThreshold(s));
                            }}
                          />
                        </Field>
                      )}
                    </FieldRFF>
                  </div>

                  {areGlobalPAreasSelected && (
                    <ProtectedAreasSelected
                      options={GLOBAL_PA_OPTIONS}
                      title="Selected protected areas:"
                      isView
                      wdpaIucnCategories={wdpaCategories.wdpaIucnCategories}
                    />
                  )}

                  {areProjectPAreasSelected && (
                    <ProtectedAreasSelected
                      options={PROJECT_PA_OPTIONS}
                      title="Uploaded protected areas:"
                      isView
                      wdpaIucnCategories={wdpaCategories.wdpaIucnCategories}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-center space-x-4">
              <Button
                theme="secondary"
                size="lg"
                type="button"
                className="relative px-20 md:px-9 lg:px-16 xl:px-20"
                disabled={submitting}
                onClick={onGoBack}
              >
                <span>Back</span>
              </Button>

              {editable && (
                <Button
                  theme="primary"
                  size="lg"
                  type="submit"
                  className="relative px-20 md:px-9 lg:px-16 xl:px-20"
                  disabled={submitting}
                >
                  <span>Save</span>
                </Button>
              )}
            </div>
          </form>
        )}
      </FormRFF>
    </Section>
  );
};

export default WDPAThreshold;
