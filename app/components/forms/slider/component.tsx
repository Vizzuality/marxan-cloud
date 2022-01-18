import React from 'react';

import { useNumberFormatter } from '@react-aria/i18n';
import { setInteractionModality } from '@react-aria/interactions';
import { useSlider } from '@react-aria/slider';
import { useSliderState } from '@react-stately/slider';
import cx from 'classnames';

import Thumb from './thumb';
import Value from './value';

const THEME = {
  dark: {
    base: 'relative w-full h-12 touch-action-none',
    filledTrack: 'absolute left-0 h-1.5 bg-white rounded',
    track: 'w-full h-1.5 bg-gray-300 rounded opacity-20',
  },
  light: {
    base: 'relative w-full h-12 touch-action-none',
    filledTrack: 'absolute left-0 h-1.5 bg-gray-800 rounded',
    track: 'w-full h-1.5 bg-gray-300 rounded opacity-20',
  },
  'dark-small': {
    base: 'relative w-full h-12 touch-action-none',
    filledTrack: 'absolute left-0 h-1.5 bg-black rounded',
    track: 'w-full h-1.5 bg-gray-300 rounded opacity-20',
  },
};

export interface SliderProps {
  /**
   * ID of the input (required)
   */
  id?: string;
  /**
   * Theme of the component
   */
  theme?: 'dark' | 'light' | 'dark-small';
  /**
   * Validation status of the input. If the `disabled` prop is set to `true`, it is overwritten to
   * `'disabled'`.
   */
  status?: 'none' | 'valid' | 'error' | 'disabled';
  /**
   * Whether the input is disabled
   */
  disabled?: boolean;
  /**
   * Whether to allow the user to click the output and edit it directly
   */
  allowEdit?: boolean,
  /**
   * Where or not to display the slider value above the thumb
   */
  showValue?: boolean,
  /**
   * Format of the value
   */
  formatOptions?: Intl.NumberFormatOptions;
  /**
   * Reference to the input's label
   */
  labelRef: React.MutableRefObject<HTMLLabelElement | null>;
  /**
   * Minimum allowed value
   */
  minValue?: number;
  /**
   * Maximum allowed value
   */
  maxValue?: number;
  /**
   * Minimum increment value
   */
  step?: number;
  /**
   * Value of the input (controlled mode)
   */
  value?: number;
  /**
   * Default value of the input (uncontrolled mode)
   */
  defaultValue?: number;
  /**
   * Callback executed when the input's value changes
   */
  onChange?: (value: number) => void;
  /**
   * Callback executed when the input receives focus
   */
  onFocus?: React.FocusEventHandler;
  /**
   * Callback executed when the input loses focus
   */
  onBlur?: React.FocusEventHandler;
}

export const Slider: React.FC<SliderProps> = ({
  theme = 'dark',
  status: rawState = 'none',
  allowEdit = true,
  showValue = true,
  disabled = false,
  formatOptions = { style: 'percent' },
  labelRef,
  maxValue,
  minValue,
  step,
  ...rest
}: SliderProps) => {
  const status = disabled ? 'disabled' : rawState;
  const onChangeOverride = rest.onChange
    ? (values: number[]) => rest.onChange(values[0])
    : undefined;
  const propsOverride = {
    // `useSliderState` is expecting `value` and `defaultValue` to be arrays
    value: rest.value !== undefined ? [rest.value] : undefined,
    defaultValue:
      rest.defaultValue !== undefined ? [rest.defaultValue] : undefined,
    onChange: onChangeOverride,
    isDisabled: disabled,
    // `useSliderState` expects a `label` attribute for accessibility, but this is worked around in
    // this component so that the `<label />` can be rendered outside of it
    label: 'workaround-label',
  };

  const trackRef = React.useRef(null);
  const sliderState = useSliderState({
    maxValue,
    minValue,
    step,
    ...rest,
    ...propsOverride,
    numberFormatter: useNumberFormatter(formatOptions),
  });
  const { groupProps, trackProps, outputProps } = useSlider(
    {
      ...rest,
      ...propsOverride,
      // `rest` contains the attribute `id` and we don't want `useSlider` to receive it because it
      // assumes the label has this id so it can connect the hidden range input to it via a
      // `aria-labelledby` attribute
      // The way our forms work is that the labels are the ones connected to the input i.e. the
      // input has the `id` attribute and the label has a `for` attribute
      // For this reason, we remove the `id` attribute from the object
      id: undefined,
      step,
    },
    sliderState,
    trackRef,
  );

  // When the user clicks the external `<label />`, the hidden range input is focused but the
  // component's status isn't updated
  // Calling `setInteractionModality` make sure the component is in the focus status
  React.useEffect(() => {
    const label = labelRef?.current;
    // Why `'keyboard'`? This is based on React Aria's on code:
    // https://github.com/adobe/react-spectrum/blob/main/packages/%40react-aria/slider/src/useSlider.ts#L178-L181
    const handler = () => setInteractionModality('keyboard');

    if (label) {
      label.addEventListener('click', handler);
    }

    return () => {
      if (label) {
        label.removeEventListener('click', handler);
      }
    };
  }, [labelRef]);

  return (
    <div
      {...groupProps}
      className={cx({
        [THEME[theme].base]: true,
        'pt-8': showValue,
        'opacity-30': status === 'disabled',
      })}
    >
      <div
        {...trackProps}
        ref={trackRef}
        className="relative flex items-center w-full h-full"
      >
        <div
          className={THEME[theme].filledTrack}
          style={{
            width: `${sliderState.getThumbPercent(0) * 100}%`,
          }}
        />
        <div className={THEME[theme].track} />
        <Thumb
          {...rest}
          theme={theme}
          status={status}
          sliderState={sliderState}
          trackRef={trackRef}
          isDisabled={disabled}
          showValue={showValue}
        />
      </div>
      { showValue && (
        <Value
          minValue={minValue}
          maxValue={maxValue}
          step={step}
          allowEdit={allowEdit}
          isDisabled={disabled}
          theme={theme}
          sliderState={sliderState}
          outputProps={outputProps}
          formatOptions={formatOptions}
          style={{
            left: `${sliderState.getThumbPercent(0) * 100}%`,
          }}
        />
      )}
    </div>
  );
};

export default Slider;
