import { useCallback, useEffect, useRef } from 'react';

import { Form as FormRFF, Field as FieldRFF, FormProps } from 'react-final-form';
import { useDispatch, useSelector } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import { useSaveScenarioPU } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';

import Select from 'components/forms/select';
import ActionsSummary from 'layout/project/sidebar/scenario/grid-setup/planning-unit-status/actions-summary';

import DrawPUMethod from './draw';
import SelectPUMethod from './select';
import UploadPUMethod from './upload';

const PU_METHODS = [
  {
    label: 'Select planning units',
    value: 'select',
  },
  {
    label: 'Draw shape on map',
    value: 'draw',
  },
  {
    label: 'Upload shapefile',
    value: 'upload',
  },
] as const;

type FormValues = { 'pu-method': (typeof PU_METHODS)[number]['value'] };

export const PlanningUnitMethods = () => {
  const scenarioPUMutation = useSaveScenarioPU({});
  const { query } = useRouter();
  const { sid } = query as { sid: string };
  const dispatch = useDispatch();
  const { addToast } = useToasts();
  const formRef = useRef<FormProps<FormValues>['form']>();

  const scenarioSlice = getScenarioEditSlice(sid);
  const {
    puTmpAvailableValue,
    puTmpIncludedValue,
    puTmpExcludedValue,
    puAction,
    drawingValue,
    uploadingValue,
    puAvailableValue,
    puIncludedValue,
    puExcludedValue,
  } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const {
    setJob,
    setDrawingValue,
    setDrawing,
    setUploading,
    setUploadingValue,
    setTmpPuExcludedValue,
    setTmpPuIncludedValue,
    setTmpPuAvailableValue,
  } = scenarioSlice.actions;

  useEffect(() => {
    const values = formRef?.current?.getState()?.values;

    // ? when the user changes the PU method, we need to reset the drawed value on the map
    // ? and let the user keep drawing on it
    if (puAction && values?.['pu-method'] === 'draw') {
      dispatch(setDrawing(null));
      dispatch(setDrawingValue(null));
      dispatch(setDrawing('polygon'));
    }
  }, [puAction]);

  const onSubmit = useCallback(
    async (values) => {
      await scenarioPUMutation.mutate(
        {
          id: `${sid}`,
          data: {
            byId: {
              include: [...puIncludedValue, ...puTmpIncludedValue],
              exclude: [...puExcludedValue, ...puTmpExcludedValue],
              makeAvailable: [...puAvailableValue, ...puTmpAvailableValue],
            },
            ...(['draw', 'upload'].includes(values['pu-method']) && {
              byGeoJson: {
                [puAction === 'available' ? 'makeAvailable' : puAction]: [
                  ...(values['pu-method'] === 'draw'
                    ? [
                        {
                          type: 'FeatureCollection',
                          features: drawingValue,
                        },
                      ]
                    : []),
                  ...(values['pu-method'] === 'upload' ? [uploadingValue] : []),
                ],
              },
            }),
          },
        },
        {
          onSuccess: ({ data: { meta } }) => {
            dispatch(setJob(new Date(meta.isoDate).getTime()));

            dispatch(setTmpPuExcludedValue([]));
            dispatch(setTmpPuIncludedValue([]));
            dispatch(setTmpPuAvailableValue([]));

            if (values['pu-method'] === 'draw') {
              dispatch(setDrawingValue(null));
              dispatch(setDrawing('polygon'));
            }

            if (values['pu-method'] === 'upload') {
              dispatch(setUploading(false));
              dispatch(setUploadingValue(null));
            }

            addToast(
              'adjust-planning-units-success',
              <>
                <h2 className="font-medium">Success!</h2>
                <ul className="text-sm">
                  <li>Planning units lock status saved</li>
                </ul>
              </>,
              {
                level: 'success',
              }
            );
          },
          onError: () => {
            addToast(
              'adjust-planning-units-error',
              <>
                <h2 className="font-medium">Error!</h2>
                <ul className="text-sm">
                  <li>Ooops! Something went wrong. Try again</li>
                </ul>
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
      puIncludedValue,
      puExcludedValue,
      puAvailableValue,
      puTmpExcludedValue,
      puTmpIncludedValue,
      puTmpAvailableValue,
      drawingValue,
      uploadingValue,
      setTmpPuExcludedValue,
      setTmpPuIncludedValue,
      setTmpPuAvailableValue,
      puAction,
      sid,
      setJob,
      scenarioPUMutation,
      addToast,
      setDrawing,
      setDrawingValue,
      setUploading,
      setUploadingValue,
    ]
  );

  return (
    <FormRFF<FormValues> onSubmit={onSubmit} initialValues={{}}>
      {({ handleSubmit, values, form }) => {
        formRef.current = form;
        return (
          <form
            onSubmit={handleSubmit}
            autoComplete="off"
            className="flex flex-grow flex-col space-y-4 text-black"
          >
            <FieldRFF name="pu-method">
              {(fprops) => (
                <Select
                  {...fprops}
                  size="base"
                  theme="dark"
                  placeholder="Select..."
                  options={PU_METHODS}
                  onChange={(value: (typeof PU_METHODS)[number]['value']) => {
                    form.change('pu-method', value);
                  }}
                />
              )}
            </FieldRFF>
            {values['pu-method'] === 'select' && <SelectPUMethod />}
            {values['pu-method'] === 'draw' && <DrawPUMethod />}
            {values['pu-method'] === 'upload' && <UploadPUMethod />}
            <ActionsSummary method={values['pu-method']} />
          </form>
        );
      }}
    </FormRFF>
  );
};

export default PlanningUnitMethods;
