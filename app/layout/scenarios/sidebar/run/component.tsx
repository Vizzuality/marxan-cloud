import React, {
  useCallback, useMemo, useState,
} from 'react';

import { Form as FormRFF } from 'react-final-form';

import cx from 'classnames';

import Button from 'components/button';
import Icon from 'components/icon';

import RUN_SVG from 'svgs/ui/run.svg?sprite';

import RunChart from './chart';
import { FIELDS } from './constants';
import RunField from './field';

export interface ScenariosRunProps {
}

export const ScenariosRun: React.FC<ScenariosRunProps> = () => {
  const [advanced, setAdvanced] = useState(false);

  const INITIAL_VALUES = useMemo(() => {
    return FIELDS.reduce((acc, f) => {
      return {
        ...acc,
        [f.id]: f.default,
      };
    }, {});
  }, []);

  const onSubmit = useCallback((values) => {
    console.info(values);
  }, []);

  return (
    <FormRFF
      onSubmit={onSubmit}
      initialValues={INITIAL_VALUES}
    >
      {({ handleSubmit }) => (
        <form
          className={cx({
            'w-full overflow-hidden flex flex-col flex-grow text-gray-500': true,
          })}
          autoComplete="off"
          noValidate
          onSubmit={handleSubmit}
        >
          <h2 className="px-10 text-2xl font-medium font-heading">Run scenario:</h2>
          <div className="flex w-full px-10 pt-5 overflow-hidden" style={{ height: 475 }}>

            <div className="flex flex-col flex-grow flex-shrink-0 space-y-6 overflow-hidden w-80">
              <div className="relative flex flex-col flex-grow overflow-hidden">
                <div className="absolute left-0 z-10 w-full h-6 pointer-events-none -top-1 bg-gradient-to-b from-white via-white" />
                <div className="pr-10 overflow-x-hidden overflow-y-auto">
                  <div className="py-6 space-y-10">
                    {FIELDS
                      .filter((f) => !f.advanced)
                      .map((f) => <RunField key={f.id} {...f} />)}

                    {FIELDS
                      .filter((f) => !!advanced && !!f.advanced)
                      .map((f) => <RunField key={f.id} {...f} />)}

                    <Button
                      theme={advanced ? 'secondary' : 'secondary-alt'}
                      size="s"
                      onClick={() => { setAdvanced(!advanced); }}
                    >
                      {advanced && 'Hide advanced settings'}
                      {!advanced && 'Advanced settings'}
                    </Button>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 z-10 w-full h-6 pointer-events-none bg-gradient-to-t from-white via-white" />
              </div>

              <div className="flex-shrink-0 pr-10">
                <Button
                  type="submit"
                  theme="primary"
                  size="base"
                  className="w-full"
                >
                  <div className="flex items-center space-x-5">
                    <div className="text-left">
                      <div className="text-lg">Run scenario</div>
                      <div className="text-sm text-gray-500">This will take 10 minutes</div>
                    </div>

                    <Icon icon={RUN_SVG} className="flex-shrink-0 w-7 h-7" />
                  </div>
                </Button>
              </div>
            </div>

            <div className="w-full h-full">
              <RunChart />
            </div>
          </div>
        </form>
      )}
    </FormRFF>
  );
};

export default ScenariosRun;
