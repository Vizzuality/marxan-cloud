import React, { useState, useRef, useEffect } from 'react';

import { useButton } from '@react-aria/button';
import { useFocus, useKeyboard } from '@react-aria/interactions';
import { SliderState } from '@react-stately/slider';
import cx from 'classnames';

const THEME = {
  dark: {
    base: 'absolute top-0 transform -translate-x-1/2 text-black',
    output: 'text-sm text-white border border-t-0 border-l-0 border-r-0 border-dashed border-white',
    input: 'absolute left-0 top-0 w-full h-full text-sm border-none bg-primary-300 rounded rounded-lg cursor-text text-center font-medium appearance-none bg-transparent text-gray-500 focus:outline-none',
  },
  light: {
    base: 'absolute top-0 transform -translate-x-1/2 text-black',
    input: 'absolute left-0 top-0 w-full h-full text-sm border-none bg-primary-300 rounded rounded-lg cursor-text text-center font-medium appearance-none bg-transparent text-gray-500 focus:outline-none',
    output: 'text-sm text-gray-800 border border-t-0 border-l-0 border-r-0 border-dashed border-gray-800',
  },
  'dark-small': {
    base: 'absolute top-0 transform -translate-x-1/2 text-black',
    input: 'absolute left-0 top-0 w-full h-full text-sm border-none bg-primary-300 rounded rounded-lg cursor-text text-center font-medium appearance-none bg-transparent text-gray-500 focus:outline-none',
    output: 'text-xs text-black',
  },
};

export interface ValueProps {
  minValue: number,
  maxValue: number,
  step?: number;
  allowEdit: boolean,
  isDisabled: boolean,
  theme: 'dark' | 'light' | 'dark-small';
  sliderState: SliderState,
  outputProps: React.OutputHTMLAttributes<HTMLOutputElement>,
  formatOptions: Intl.NumberFormatOptions;
  style: Record<string, unknown>;
}

export const Value: React.FC<ValueProps> = ({
  minValue,
  maxValue,
  step,
  theme,
  allowEdit,
  isDisabled,
  sliderState,
  outputProps,
  formatOptions,
  style,
}: ValueProps) => {
  const wrapperRef = useRef<HTMLInputElement>(null);
  const outputButtonRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [value, setValue] = useState<number>(sliderState.getThumbValue(0));
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Percentages come in a range from 0.0 to 1, so we have to multiply by 100 to display them
  // Due to floating point precision issues, we need to trunc percentages' display values
  const displayValue = (formatOptions.style === 'percent') ? Math.round(value * 100) : value;

  // CANCELLING AND SAVING EDITS

  const cancelEdit = () => {
    setValue(sliderState.getThumbValue(0));
    setIsEditing(false);
  };

  const saveEdit = () => {
    if (value >= minValue && value <= maxValue) {
      sliderState.setThumbValue(0, value);
      setIsEditing(false);
    } else {
      cancelEdit();
    }
  };

  // INPUTS/OUTPUTS INTERACTIONS

  const handleInputChange = (event: React.ChangeEvent<HTMLElement>) => {
    const target = event.target as HTMLTextAreaElement;
    const newValue = parseFloat(target.value);

    // Percentages come in a range from 0.0 to 1, so we have to divide by 100 to set them
    setValue((formatOptions.style === 'percent') ? newValue / 100 : newValue);
  };

  const handleOutputPress = () => {
    if (isDisabled || !allowEdit) return;
    setIsEditing(true);
  };

  const { focusProps: inputFocusProps } = useFocus({
    onBlur: saveEdit,
  });

  const { keyboardProps: inputKeyboardProps } = useKeyboard({
    onKeyDown: (event) => {
      switch (event.key) {
        case 'Enter':
          // This may be used inside a form, so we want to prevent it from submitting
          event.preventDefault();
          saveEdit();
          break;
        case 'Escape':
          cancelEdit();
          break;
        default:
      }
    },
  });

  const { buttonProps: outputButtonProps } = useButton({
    elementType: 'div',
    'aria-label': 'Edit',
    onPress: handleOutputPress,
  }, outputButtonRef);

  // EFFECTS

  useEffect(() => {
    setValue(sliderState.getThumbValue(0));
  }, [sliderState]);

  useEffect(() => {
    setIsEditing(false);
  }, [isDisabled]);

  useEffect(() => {
    if (!isEditing) return;
    inputRef.current.focus();
  }, [inputRef, isEditing]);

  // JSX

  return (
    <div
      className={THEME[theme].base}
      ref={wrapperRef}
      style={style}
    >
      { isEditing ? (
        <div>
          <span
            className="invisible px-2"
            aria-hidden="true"
          >
            {Number.isNaN(value) ? '' : displayValue}
          </span>
          <input
            ref={inputRef}
            className={THEME[theme].input}
            type="number"
            step={step}
            value={displayValue}
            onChange={handleInputChange}
            {...inputFocusProps}
            {...inputKeyboardProps}
          />
        </div>
      ) : (
        <div
          ref={outputButtonRef}
          className={cx({
            'cursor-default': !allowEdit,
            'cursor-text': allowEdit,
          })}
          {...outputButtonProps}
        >
          <output
            className={THEME[theme].output}
            style={{
              left: `${sliderState.getThumbValue(0) * 100}%`,
            }}
            {...outputProps}
          >
            {sliderState.getThumbValueLabel(0)}
          </output>
        </div>
      )}
    </div>
  );
};

export default Value;
