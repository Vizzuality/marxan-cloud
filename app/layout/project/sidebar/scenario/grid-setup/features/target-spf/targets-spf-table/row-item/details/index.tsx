import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import { useCanEditScenario } from 'hooks/permissions';

import Input from 'components/forms/input';

const INPUT_CLASES = 'w-[55px] rounded-md border-solid border-gray-600 px-0 py-1 text-center';

export const RowDetails = ({ item, onChange }): JSX.Element => {
  const { query } = useRouter();
  const { pid, sid } = query as { pid: string; sid: string };
  const editable = useCanEditScenario(pid, sid);
  const { marxanSettings: { prop = 50, fpf = 1 } = {}, id } = item;
  const [values, setValues] = useState({
    target: prop,
    spf: fpf,
  });

  useEffect(() => {
    setValues({
      target: prop,
      spf: fpf,
    });
  }, [prop, fpf]);

  return (
    <div className="flex w-full justify-end space-x-3">
      <div className="flex items-center space-x-2">
        <span>Target</span>
        <Input
          className={INPUT_CLASES}
          theme="dark"
          mode="dashed"
          type="number"
          min={0}
          max={100}
          step={0.01}
          defaultValue={values.target}
          value={values.target}
          disabled={!editable}
          onChange={({ target: { value: inputValue } }) => {
            const numericValue = Number(inputValue);
            if (numericValue < 0 || numericValue > 100) return;

            setValues((prevValues) => ({
              ...prevValues,
              target: numericValue,
            }));

            onChange(id, { target: numericValue });
          }}
        />
        <span className="text-xs">%</span>
      </div>
      <div className="flex items-center space-x-2">
        <span>SPF</span>
        <Input
          className={INPUT_CLASES}
          theme="dark"
          mode="dashed"
          type="number"
          step={0.01}
          min={0}
          defaultValue={values.spf}
          value={values.spf}
          disabled={!editable}
          onChange={({ target: { value: inputValue } }) => {
            const numericValue = Number(inputValue);
            if (numericValue <= 0) return;

            setValues((prevValues) => ({
              ...prevValues,
              spf: numericValue,
            }));

            onChange(id, { spf: numericValue });
          }}
        />
      </div>
    </div>
  );
};

export default RowDetails;
