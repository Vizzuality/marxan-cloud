import { useState } from 'react';

import Input from 'components/forms/input';

const DEFAULT_INPUT_VALUES = {
  target: 50,
  spf: 1,
};

const INPUT_CLASSES =
  'w-[55px] rounded-md border-solid border-gray-600 bg-gray-900 bg-opacity-100 px-0 py-1 text-center leading-tight';

const AllTargetsSelector = ({
  onChangeAllTargets,
  onChangeAllSPF,
}: {
  onChangeAllTargets: (target: number) => void;
  onChangeAllSPF: (spf: number) => void;
}): JSX.Element => {
  const [values, setValues] = useState(DEFAULT_INPUT_VALUES);

  return (
    <div className="flex justify-between rounded-lg bg-gray-700 px-[10px] py-[5px] text-sm">
      <span className="flex max-w-[115px] text-xs text-white">
        Set target and SPF in all features:
      </span>
      <div className="flex space-x-2">
        <div className="flex items-center space-x-2">
          <span>Target</span>
          <Input
            className={INPUT_CLASSES}
            theme="dark"
            mode="dashed"
            type="number"
            min={0}
            max={100}
            defaultValue={values.target}
            value={values.target}
            // disabled={!editable}
            onChange={({ target: { value: inputValue } }) => {
              setValues((prevValues) => ({
                ...prevValues,
                target: Number(inputValue),
              }));
            }}
            onKeyDownCapture={(event) => {
              if (event.key === 'Enter') {
                onChangeAllTargets(Number(values.target));
              }
            }}
            onBlur={() => {
              // If user leaves the input empty, we'll revert to the original targetValue
              if (!values.target) {
                return setValues((prevValues) => ({
                  ...prevValues,
                  target: DEFAULT_INPUT_VALUES.target,
                }));
              }

              setValues((prevValues) => ({
                ...prevValues,
                target: values.target,
              }));

              onChangeAllTargets(Number(values.target));
            }}
          />
          <span className="text-xs">%</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>SPF</span>
          <Input
            className={INPUT_CLASSES}
            theme="dark"
            mode="dashed"
            type="number"
            defaultValue={values.spf}
            // value={inputFPFValue}
            // disabled={!editable}
            onChange={({ target: { value: inputValue } }) => {
              setValues((prevValues) => ({
                ...prevValues,
                spf: Number(inputValue),
              }));
            }}
            onKeyDownCapture={(event) => {
              if (event.key === 'Enter') {
                onChangeAllSPF(Number(values.spf));
              }
            }}
            onBlur={() => {
              if (!values.spf) {
                return setValues((prevValues) => ({
                  ...prevValues,
                  target: DEFAULT_INPUT_VALUES.spf,
                }));
              }

              setValues((prevValues) => ({
                ...prevValues,
                spf: values.spf,
              }));

              onChangeAllSPF(Number(values.spf));
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AllTargetsSelector;
