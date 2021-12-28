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
  allowEdit: boolean,
  isDisabled: boolean,
  theme: 'dark' | 'light' | 'dark-small';
  sliderState: SliderState,
  outputProps: React.OutputHTMLAttributes<HTMLOutputElement>,
  style: Record<string, unknown>;
}

export const Value: React.FC<ValueProps> = ({
  minValue,
  maxValue,
  theme,
  allowEdit,
  isDisabled,
  sliderState,
  outputProps,
  style,

}: ValueProps) => {
  const wrapperRef = useRef<HTMLInputElement>(null);
  const outputButtonRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [value, setValue] = useState<number>(sliderState.getThumbValue(0));
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Saving and Cancelling the edit

  const cancelEdit = () => {
    setValue(sliderState.getThumbValue(0) * 100);
    setIsEditing(false);
  };

  const saveEdit = () => {
    const thumbValue = value / 100;

    if (thumbValue >= minValue && thumbValue <= maxValue) {
      sliderState.setThumbValue(0, thumbValue);
      setIsEditing(false);
    } else {
      cancelEdit();
    }
  };

  // Handling inputs/ouputs interactions

  const handleInputChange = (event: React.ChangeEvent<HTMLElement>) => {
    const target = event.target as HTMLTextAreaElement;
    setValue(parseInt(target.value, 10));
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

  // Effects

  useEffect(() => {
    setValue(sliderState.getThumbValue(0) * 100);
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
            {/* Math.random To overcome floating point issues */}
            {Number.isNaN(value) ? '' : Math.round(value)}
          </span>
          <input
            ref={inputRef}
            className={THEME[theme].input}
            type="number"
            // Math.random To overcome floating point issues
            value={Math.round(value)}
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
