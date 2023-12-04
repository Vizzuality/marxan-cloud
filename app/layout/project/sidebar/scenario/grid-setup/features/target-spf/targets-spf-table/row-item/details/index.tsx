import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import { useCanEditScenario } from 'hooks/permissions';

import Input from 'components/forms/input';

export const RowDetails = ({ item, onChange }): JSX.Element => {
  const { query } = useRouter();
  const { pid, sid } = query as { pid: string; sid: string };
  const editable = useCanEditScenario(pid, sid);
  const { marxanSettings: { prop = 50, fpf = 1 } = {}, id } = item;
  const [values, setValues] = useState({
    target: prop * 100,
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
          className="w-[55px] rounded-md border-solid border-gray-600 py-1 text-center"
          theme="dark"
          mode="dashed"
          type="number"
          defaultValue={values.target}
          value={values.target}
          disabled={!editable}
          onChange={({ target: { value: inputValue } }) => {
            setValues((prevValues) => ({
              ...prevValues,
              target: Number(inputValue),
            }));

            onChange(id, { target: Number(inputValue) });
          }}
        />
        <span className="text-xs">%</span>
      </div>
      <div className="flex items-center space-x-2">
        <span>SPF</span>
        <Input
          className="w-[55px] rounded border border-solid py-1 "
          theme="dark"
          mode="dashed"
          type="number"
          defaultValue={values.spf}
          value={values.spf}
          disabled={!editable}
          onChange={({ target: { value: inputValue } }) => {
            setValues((prevValues) => ({
              ...prevValues,
              spf: Number(inputValue),
            }));

            onChange(id, { spf: Number(inputValue) });
          }}
        />
      </div>
    </div>
  );
};

export default RowDetails;
