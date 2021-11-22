import React, { useEffect, useMemo } from 'react';

import { Form as FormRFF, FormSpy as FormSpyRFF, Field as FieldRFF } from 'react-final-form';
import { useDispatch } from 'react-redux';

import intersection from 'lodash/intersection';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { useProject } from 'hooks/projects';
import { useScenario } from 'hooks/scenarios';
import { useWDPACategories } from 'hooks/wdpa';

import ProtectedAreaUploader from 'layout/scenarios/edit/wdpa/categories/pa-uploader';
import ProtectedAreasSelected from 'layout/scenarios/edit/wdpa/pa-selected';

import Button from 'components/button';
import Field from 'components/forms/field';
import Label from 'components/forms/label';
import Select from 'components/forms/select';
import { composeValidators } from 'components/forms/validations';
import InfoButton from 'components/info-button';
import Loading from 'components/loading';

export interface WDPACategoriesProps {
  onSuccess: () => void,
  onDismiss: () => void,
}

export const WDPACategories: React.FC<WDPACategoriesProps> = ({
  onSuccess,
  onDismiss,
}: WDPACategoriesProps) => {
  const { query } = useRouter();
  const { pid, sid } = query;

  const scenarioSlice = getScenarioEditSlice(sid);
  const { setWDPACategories, setWDPAThreshold } = scenarioSlice.actions;
  const dispatch = useDispatch();

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
    refetch: refetchProtectedAreas,
  } = useWDPACategories({
    adminAreaId: projectData?.adminAreaLevel2Id
      || projectData?.adminAreaLevel1I
      || projectData?.countryId,
    customAreaId: !projectData?.adminAreaLevel2Id
      && !projectData?.adminAreaLevel1I
      && !projectData?.countryId ? projectData?.planningAreaId : null,
    scenarioId: sid,
  });

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
    return {
      wdpaIucnCategories: scenarioData?.wdpaIucnCategories || [],
    };
  }, [scenarioData?.wdpaIucnCategories]);

  useEffect(() => {
    const { wdpaThreshold } = scenarioData;
    if (wdpaThreshold) {
      dispatch(setWDPAThreshold(wdpaThreshold / 100));
    }
  }, [scenarioData]); //eslint-disable-line

  const onSubmit = () => console.log('on');

  // Loading
  if ((scenarioIsFetching && !scenarioIsFetched) || (wdpaIsFetching && !wdpaIsFetched)) {
    return (
      <Loading
        visible
        className="relative flex items-center justify-center w-full h-16"
        iconClassName="w-10 h-10 text-white"
      />
    );
  }

  if (!wdpaData || !wdpaData.length) {
    return (
      <div>
        <div className="text-sm">This planning area doesn&apos;t have any protected areas associated with it. You can go directly to the features tab.</div>

        <div className="flex justify-center mt-20">
          <Button theme="secondary-alt" size="lg" type="button" className="relative px-20" onClick={onDismiss}>
            <span>Continue to features</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <FormRFF
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
      render={({ form, values, handleSubmit }) => {
        if (form.getState().touched.uploadedProtectedArea) {
          refetchProtectedAreas();
        }

        const plainWDPAOptions = WDPA_OPTIONS.map((o) => o.value);
        const plainProjectPAOptions = PROJECT_PA_OPTIONS.map((o) => o.value);

        const areWDPAreasSelected = intersection(plainWDPAOptions,
          values.wdpaIucnCategories).length > 0;
        const areProjectPAreasSelected = intersection(plainProjectPAOptions,
          values.wdpaIucnCategories).length > 0;

        return (
          <form
            onSubmit={handleSubmit}
            autoComplete="off"
            className="relative flex flex-col flex-grow w-full overflow-hidden"
          >
            <FormSpyRFF onChange={(state) => {
              dispatch(setWDPACategories(state.values));
            }}
            />

            <div className="relative flex flex-col flex-grow overflow-hidden">
              <div className="absolute top-0 left-0 z-10 w-full h-6 pointer-events-none bg-gradient-to-b from-gray-700 via-gray-700" />

              <div className="relative px-0.5 overflow-x-visible overflow-y-auto">
                <div className="py-6">
                  {/* WDPA */}

                  <div>
                    <FieldRFF
                      name="wdpaIucnCategories"
                    >
                      {(fprops) => (
                        <Field id="wdpaIucnCategories" {...fprops}>
                          <div className="flex items-center mb-3">
                            <Label theme="dark" className="mr-3 uppercase">Choose one or more protected areas categories</Label>
                            <InfoButton>
                              <span>
                                <h4 className="font-heading text-lg mb-2.5">IUCN categories</h4>
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
                              selected={values.wdpaIucnCategories}
                              options={ORDERED_WDPA_CATEGORIES_OPTIONS}
                              onChange={fprops.input.onChange}
                            />
                          )}
                        </Field>
                      )}
                    </FieldRFF>
                  </div>

                  <p className="py-4 text-sm text-center">or</p>
                  <FieldRFF
                    name="uploadedProtectedArea"
                    validate={composeValidators([{ presence: true }])}
                  >
                    {(flprops) => {
                      return (
                        <ProtectedAreaUploader
                          {...flprops}
                        />
                      );
                    }}
                  </FieldRFF>

                  {values.wdpaIucnCategories.length > 0 && areWDPAreasSelected && (
                    <ProtectedAreasSelected
                      form={form}
                      options={WDPA_OPTIONS}
                      title="Selected protected areas:"
                      wdpaIucnCategories={values.wdpaIucnCategories}
                    />
                  )}

                  {values.wdpaIucnCategories.length > 0 && areProjectPAreasSelected && (
                    <ProtectedAreasSelected
                      form={form}
                      options={PROJECT_PA_OPTIONS}
                      title="Uploaded protected areas:"
                      wdpaIucnCategories={values.wdpaIucnCategories}
                    />
                  )}

                </div>
              </div>
              <div className="absolute bottom-0 left-0 z-10 w-full h-6 pointer-events-none bg-gradient-to-t from-gray-700 via-gray-700" />
            </div>
            <div className="flex justify-center mt-5 space-x-2">
              <Button
                theme="secondary-alt"
                size="lg"
                type={values.wdpaIucnCategories.length > 0 ? 'submit' : 'button'}
                className="relative px-20"
                onClick={() => (values.wdpaIucnCategories.length > 0 ? onSuccess() : onDismiss())}
              >
                {!!values.wdpaIucnCategories.length && (
                  <span>Continue</span>
                )}

                {!values.wdpaIucnCategories.length && (
                  <span>Skip to features</span>
                )}
              </Button>
            </div>
          </form>
        );
      }}
    />
  );
};

export default WDPACategories;
