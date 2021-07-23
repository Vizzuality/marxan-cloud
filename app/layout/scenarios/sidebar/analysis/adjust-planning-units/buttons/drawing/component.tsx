import React, { useCallback, useEffect, useMemo } from 'react';

import cx from 'classnames';

import Button from 'components/button';
import Icon from 'components/icon';

import { Form as FormRFF } from 'react-final-form';

import { useToasts } from 'hooks/toast';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { getScenarioSlice } from 'store/slices/scenarios/edit';

import DRAW_SHAPE_SVG from 'svgs/ui/draw.svg?sprite';
import { useSaveScenarioPU } from 'hooks/scenarios';

export interface AnalysisAdjustDrawingProps {
  type: string;
  selected: boolean;
  onSelected: (s: string) => void;
}

export const AnalysisAdjustDrawing: React.FC<AnalysisAdjustDrawingProps> = ({
  type,
  selected,
  onSelected,
}: AnalysisAdjustDrawingProps) => {
  const { query } = useRouter();
  const { sid } = query;

  const { addToast } = useToasts();

  const scenarioSlice = getScenarioSlice(sid);
  const { setDrawing, setDrawingValue, setCache } = scenarioSlice.actions;
  const dispatch = useDispatch();
  const { drawingValue } = useSelector((state) => state[`/scenarios/${sid}/edit`]);

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
    // Save current drawn shape
    scenarioPUMutation.mutate({
      id: `${sid}`,
      data: {
        byGeoJson: {
          [values.type]: [{
            type: 'FeatureCollection',
            features: values.drawingValue,
          }],
        },
      },
    }, {
      onSuccess: () => {
        console.info('SUCCESS');
        onSelected(null);
        dispatch(setCache(Date.now()));
        dispatch(setDrawing(null));
        dispatch(setDrawingValue(null));

        addToast('adjust-planning-units-success', (
          <>
            <h2 className="font-medium">Success!</h2>
            <ul className="text-sm">
              <li>Planning units saved</li>
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
    });
  }, [
    sid,
    scenarioPUMutation,
    onSelected,
    dispatch,
    setDrawing,
    setDrawingValue,
    setCache,
    addToast,
  ]);

  return (
    <FormRFF
      key="drawing-form"
      onSubmit={onSubmit}
      initialValues={INITIAL_VALUES}
    >
      {({ handleSubmit }) => (
        <form onSubmit={handleSubmit} autoComplete="off">
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

export default AnalysisAdjustDrawing;
