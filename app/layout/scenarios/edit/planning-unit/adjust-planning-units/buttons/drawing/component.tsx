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

import DRAW_SHAPE_SVG from 'svgs/ui/draw.svg?sprite';

export interface PlanningUnitDrawingProps {
  type: string;
  selected: boolean;
  onSelected: (s: string) => void;
}

export const PlanningUnitDrawing: React.FC<PlanningUnitDrawingProps> = ({
  type,
  selected,
  onSelected,
}: PlanningUnitDrawingProps) => {
  const [submitting, setSubmitting] = useState(false);
  const { query } = useRouter();
  const { sid } = query;

  const { addToast } = useToasts();

  const scenarioSlice = getScenarioEditSlice(sid);
  const {
    setJob,
    setDrawing,
    setDrawingValue,
  } = scenarioSlice.actions;
  const dispatch = useDispatch();
  const {
    puIncludedValue,
    puExcludedValue,
    drawingValue,
  } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

  const scenarioPUMutation = useSaveScenarioPU({});

  const INITIAL_VALUES = useMemo(() => {
    return {
      type,
      drawingValue,
    };
  }, [type, drawingValue]);

  // Effects
  useEffect(() => {
    if (selected) {
      dispatch(setDrawing('polygon'));
    }

    if (!selected) {
      dispatch(setDrawing(null));
      dispatch(setDrawingValue(null));
    }

    // Unmount
    return () => {
      dispatch(setDrawing(null));
      dispatch(setDrawingValue(null));
    };
  }, [selected]); // eslint-disable-line

  // Callbacks
  const onSubmit = useCallback((values) => {
    setSubmitting(true);
    // Save current drawn shape
    scenarioPUMutation.mutate({
      id: `${sid}`,
      data: {
        byId: {
          include: puIncludedValue,
          exclude: puExcludedValue,
        },
        byGeoJson: {
          [values.type]: [{
            type: 'FeatureCollection',
            features: values.drawingValue,
          }],
        },
      },
    }, {
      onSuccess: ({ data: { meta } }) => {
        // Let's wait unitl we can track fast async jobs
        dispatch(setJob(new Date(meta.isoDate).getTime()));
        onSelected(null);
        dispatch(setDrawing(null));
        dispatch(setDrawingValue(null));

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
  }, [
    sid,
    scenarioPUMutation,
    puIncludedValue,
    puExcludedValue,
    onSelected,
    dispatch,
    setDrawing,
    setDrawingValue,
    setJob,
    addToast,
  ]);

  return (
    <FormRFF
      key="drawing-form"
      onSubmit={onSubmit}
      initialValues={INITIAL_VALUES}
    >
      {({ handleSubmit }) => (
        <form onSubmit={handleSubmit} autoComplete="off" className="relative">
          <div
            key="drawing"
            role="presentation"
            className={cx({
              'text-sm py-2.5 focus:outline-none relative transition rounded-3xl px-10 cursor-pointer': true,
              'bg-gray-600 text-gray-200 opacity-50': !selected,
              'bg-gray-600 text-white': selected,
            })}
            onClick={() => onSelected('drawing')}
          >
            <header className="relative flex justify-between w-full">
              <div
                className={cx({
                  'text-center': !selected,
                  'text-left': selected,
                })}
              >
                Draw shape on map
              </div>

              {!selected && (
                <Icon
                  className="absolute right-0 w-5 h-5 transform -translate-y-1/2 top-1/2"
                  icon={DRAW_SHAPE_SVG}
                />
              )}

              {selected && (
                <div className="flex items-center space-x-3 divide-x-2">
                  <Button
                    theme="secondary-alt"
                    size="s"
                    onClickCapture={() => {
                      onSelected(null);
                    }}
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
                  {/* <button
                    type="button"
                    className="flex items-center justify-center h-5 pl-5 pr-1 focus:outline-none"
                    onClickCapture={() => {
                      setSelected(null);
                    }}
                  >
                    <Icon
                      className="w-3 h-3 text-primary-500"
                      icon={ARROW_UP_SVG}
                    />
                  </button> */}
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
                  <p className="text-sm text-gray-300">Click over the map and draw a shape.</p>
                </div>
              </div>
            )}
          </div>
        </form>
      )}
    </FormRFF>
  );
};

export default PlanningUnitDrawing;
