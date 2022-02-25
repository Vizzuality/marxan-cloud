import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';

import { Form as FormRFF } from 'react-final-form';
import { useSelector, useDispatch } from 'react-redux';

import { useRouter } from 'next/router';

import { getScenarioEditSlice } from 'store/slices/scenarios/edit';

import cx from 'classnames';

import { useSaveScenarioPU } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import Icon from 'components/icon';
import Loading from 'components/loading';

import SELECT_PLANNING_UNITS_SVG from 'svgs/ui/planning-units.svg?sprite';

export interface PlanningUnitClickingProps {
  type: string;
  selected: boolean;
  onSelected: (s: string) => void;
}

export const PlanningUnitClicking: React.FC<PlanningUnitClickingProps> = ({
  type,
  selected,
  onSelected,
}: PlanningUnitClickingProps) => {
  const [submitting, setSubmitting] = useState(false);
  const { query } = useRouter();
  const { sid } = query;

  const { addToast } = useToasts();

  const scenarioSlice = getScenarioEditSlice(sid);
  const {
    setJob,
    setClicking,
    setTmpPuIncludedValue,
    setTmpPuExcludedValue,
  } = scenarioSlice.actions;

  const dispatch = useDispatch();
  const {
    puIncludedValue, puExcludedValue, puTmpIncludedValue, puTmpExcludedValue,
  } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const scenarioPUMutation = useSaveScenarioPU({});

  const INITIAL_VALUES = useMemo(() => {
    return {
      type,
      puTmpIncludedValue,
      puTmpExcludedValue,
    };
  }, [type, puTmpIncludedValue, puTmpExcludedValue]);

  // Effects
  useEffect(() => {
    if (selected) {
      dispatch(setClicking(true));
    }

    if (!selected) {
      dispatch(setClicking(false));
      dispatch(setTmpPuIncludedValue(puIncludedValue));
      dispatch(setTmpPuExcludedValue(puExcludedValue));
    }

    // Unmount
    return () => {
      dispatch(setClicking(false));
    };
  }, [selected]); // eslint-disable-line

  // Callbacks
  const onSubmit = useCallback((values) => {
    setSubmitting(true);
    // Save current clicked pu ids
    scenarioPUMutation.mutate({
      id: `${sid}`,
      data: {
        byId: {
          include: values.puTmpIncludedValue,
          exclude: values.puTmpExcludedValue,
          [values.type]: values.type === 'include' ? values.puTmpIncludedValue : values.puTmpExcludedValue,
        },
      },
    }, {
      onSuccess: ({ data: { meta } }) => {
        dispatch(setJob(new Date(meta.isoDate).getTime()));
        onSelected(null);
        dispatch(setClicking(false));

        addToast('adjust-planning-units-success', (
          <>
            <h2 className="font-medium">Success!</h2>
            <ul className="text-sm">
              <li>Planning units lock status saved</li>
            </ul>
          </>
        ), {
          level: 'success',
        });
      },
      onError: () => {
        addToast('adjust-planning-units-error', (
          <>
            <h2 className="font-medium">Error!</h2>
            <ul className="text-sm">
              <li>Ooops! Something went wrong. Try again</li>
            </ul>
          </>
        ), {
          level: 'error',
        });
      },
      onSettled: () => {
        setSubmitting(false);
      },
    });
  }, [sid,
    scenarioPUMutation,
    onSelected,
    dispatch,
    setClicking,
    setJob,
    addToast,
  ]);

  const onCancel = useCallback(() => {
    onSelected(null);

    dispatch(setTmpPuIncludedValue(puIncludedValue));
    dispatch(setTmpPuExcludedValue(puExcludedValue));
  }, [
    onSelected,
    puIncludedValue,
    puExcludedValue,
    dispatch,
    setTmpPuIncludedValue,
    setTmpPuExcludedValue,
  ]);

  return (
    <FormRFF
      key="clicking-form"
      onSubmit={onSubmit}
      initialValues={INITIAL_VALUES}
    >
      {({ handleSubmit }) => (
        <form onSubmit={handleSubmit} autoComplete="off" className="relative">
          <div
            key="clicking"
            role="presentation"
            className={cx({
              'text-sm py-2.5 focus:outline-none relative transition rounded-3xl px-10 cursor-pointer': true,
              'bg-gray-600 text-gray-200 opacity-50': !selected,
              'bg-gray-600 text-white': selected,
            })}
            onClick={() => onSelected('clicking')}
          >
            <header className="relative flex justify-between w-full">
              <div
                className={cx({
                  'text-center': !selected,
                  'text-left': selected,
                })}
              >
                Select planning units
              </div>

              {!selected && (
                <Icon
                  className="absolute right-0 w-5 h-5 transform -translate-y-1/2 top-1/2"
                  icon={SELECT_PLANNING_UNITS_SVG}
                />
              )}

              {selected && (
                <div className="flex items-center space-x-3 divide-x-2">
                  <Button
                    theme="secondary-alt"
                    size="s"
                    onClickCapture={onCancel}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    theme="primary"
                    size="s"
                    disabled={submitting}
                  >
                    Save
                  </Button>
                </div>
              )}

            </header>

            <Loading
              visible={submitting}
              className="absolute top-0 left-0 z-40 flex items-center justify-center w-full h-full bg-gray-600 bg-opacity-90 rounded-3xl"
              iconClassName="w-10 h-5 text-primary-500"
            />

            {selected && (
              <div className="pt-2">
                <div className="flex w-full">
                  <p className="text-sm text-gray-300">Click over the map, and select planning units.</p>
                </div>
              </div>
            )}
          </div>
        </form>
      )}
    </FormRFF>
  );
};

export default PlanningUnitClicking;
