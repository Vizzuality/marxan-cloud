import React, {
  useCallback, useMemo, useState, useEffect,
} from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import { useDispatch, useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { mergeScenarioStatusMetaData } from 'utils/utils-scenarios';

import { useProject } from 'hooks/projects';
import { useScenario, useSaveScenario } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';
import { useWDPACategories, useSaveScenarioProtectedAreas } from 'hooks/wdpa';

import ProtectedAreasSelected from 'layout/scenarios/edit/planning-unit/protected-areas/pa-selected';

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
  const { pid, sid } = query;

  const { wdpaCategories } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

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

  const {
    data: wdpaData,
    isFetching: wdpaIsFetching,
    isFetched: wdpaIsFetched,
  } = useWDPACategories({
    adminAreaId: projectData?.adminAreaLevel2Id
      || projectData?.adminAreaLevel1I
      || projectData?.countryId,
    customAreaId: !projectData?.adminAreaLevel2Id
      && !projectData?.adminAreaLevel1I
      && !projectData?.countryId ? projectData?.planningAreaId : null,
    scenarioId: sid,
  });

  const saveScenarioMutation = useSaveScenario({
    requestConfig: {
      method: 'PATCH',
    },
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
    const { wdpaIucnCategories } = wdpaCategories;
    return wdpaData.filter((pa) => wdpaIucnCategories.includes(pa.id)).map((pa) => {
      return {
        id: pa.id,
        selected: true,
      };
    });
  }, [wdpaCategories, wdpaData]);

  const INITIAL_VALUES = useMemo(() => {
    const { wdpaThreshold, wdpaIucnCategories } = scenarioData;

    return {
      wdpaThreshold: wdpaThreshold ? wdpaThreshold / 100 : 0.75,
      wdpaIucnCategories: wdpaIucnCategories || [],
    };
  }, [scenarioData]);

  const globalPAreasSelectedIds = useMemo(() => {
    const { wdpaIucnCategories } = wdpaCategories;
    return GLOBAL_PA_OPTIONS
      .map((p) => p.value)
      .filter((p) => wdpaIucnCategories?.includes(p));
  }, [wdpaCategories, GLOBAL_PA_OPTIONS]);

  const projectPAreasSelectedIds = useMemo(() => {
    const { wdpaIucnCategories } = wdpaCategories;
    return PROJECT_PA_OPTIONS
      .map((p) => p.value)
      .filter((p) => wdpaIucnCategories?.includes(p));
  }, [wdpaCategories, PROJECT_PA_OPTIONS]);

  const areGlobalPAreasSelected = !!globalPAreasSelectedIds.length;
  const areProjectPAreasSelected = !!projectPAreasSelectedIds.length;

  useEffect(() => {
    const { wdpaThreshold } = scenarioData;
    dispatch(setWDPAThreshold(wdpaThreshold ? wdpaThreshold / 100 : 0.75));
  }, [scenarioData]); //eslint-disable-line

  const handleSubmit = useCallback((values) => {
    setSubmitting(true);

    const { wdpaThreshold } = values;

    saveScenarioProtectedAreasMutation.mutate({
      id: `${sid}`,
      data: {
        areas: selectedProtectedAreas,
        threshold: +(wdpaThreshold * 100).toFixed(0),
      },
    }, {
      onSuccess: () => {
        onSuccess();
        setSubmitting(false);
        addToast('save-scenario-wdpa', (
          <>
            <h2 className="font-medium">Success!</h2>
            <p className="text-sm">Scenario WDPA threshold saved</p>
          </>
        ), {
          level: 'success',
        });
        saveScenarioMutation.mutate({
          id: `${sid}`,
          data: {
            metadata: mergeScenarioStatusMetaData(metadata, { tab: 'features', subtab: 'features-preview' }),
          },
        });
      },
      onError: () => {
        setSubmitting(false);

        addToast('error-scenario-wdpa', (
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">Scenario WDPA threshold not saved</p>
          </>
        ), {
          level: 'error',
        });
      },
    });
  }, [
    saveScenarioProtectedAreasMutation,
    selectedProtectedAreas,
    sid,
    saveScenarioMutation,
    metadata,
    addToast,
    onSuccess]);

  const handleBack = useCallback(() => {
    onBack();
  }, [onBack]);

  // Loading
  if (
    (!!scenarioData && scenarioIsFetching && !scenarioIsFetched)
    || (!!wdpaData && wdpaIsFetching && !wdpaIsFetched)
  ) {
    return (
      <Loading
        visible
        className="relative flex items-center justify-center w-full h-16"
        iconClassName="w-10 h-10 text-white"
      />
    );
  }

  return (
    <FormRFF
      onSubmit={handleSubmit}
      initialValues={INITIAL_VALUES}
    >
      {({ values, handleSubmit: RFFhandleSubmit }) => (
        <form onSubmit={RFFhandleSubmit} autoComplete="off" className="relative flex flex-col flex-grow w-full overflow-hidden">
          <Loading
            visible={submitting}
            className="absolute top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center w-full h-full bg-gray-700 bg-opacity-90"
            iconClassName="w-10 h-10 text-white"
          />

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
                              <h4 className="font-heading text-lg mb-2.5">Threshold for Protected Areas</h4>
                              <div className="space-y-2">
                                <p>
                                  Refers to what percentage of a planning
                                  unit must be covered by a protected area
                                  to be considered &quot;protected&quot; by Marxan.
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
            <div className="absolute bottom-0 left-0 z-10 w-full h-6 pointer-events-none bg-gradient-to-t from-gray-700 via-gray-700" />
          </div>

          <div className="flex justify-center mt-5 space-x-4">
            <Button
              theme="secondary"
              size="lg"
              type="button"
              className="relative px-20 md:px-9 lg:px-16 xl:px-20"
              disabled={submitting}
              onClick={handleBack}
            >
              <span>Set areas</span>
            </Button>

            <Button
              theme="primary"
              size="lg"
              type="submit"
              className="relative px-20 md:px-9 lg:px-16 xl:px-20"
              disabled={submitting}
            >
              <span>Save</span>
            </Button>
          </div>
        </form>
      )}
    </FormRFF>
  );
};

export default WDPAThreshold;
