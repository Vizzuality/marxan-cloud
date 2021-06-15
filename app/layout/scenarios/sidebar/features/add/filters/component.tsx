import React, { useCallback, useMemo } from 'react';

import cx from 'classnames';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import Button from 'components/button';

export interface ScenarioFeaturesAddFiltersProps {
  filters?: Record<string, any>;
  onChangeFilters: (filters: Record<string, any>) => void;
  onDismiss?: () => void;
}

const TAGS = [
  { id: 'species', label: 'species' },
  { id: 'bioregional', label: 'bioregional' },
];

export const ScenarioFeaturesAddFilters: React.FC<ScenarioFeaturesAddFiltersProps> = ({
  filters = {}, onChangeFilters, onDismiss,
}: ScenarioFeaturesAddFiltersProps) => {
  const INITIAL_VALUES = useMemo(() => {
    return filters;
  }, [filters]);

  // Callbacks
  const onSubmit = useCallback((values) => {
    onChangeFilters(values);
    if (onDismiss) onDismiss();
  }, [onChangeFilters, onDismiss]);

  const onClear = useCallback(() => {
    onChangeFilters({});
    if (onDismiss) onDismiss();
  }, [onChangeFilters, onDismiss]);

  return (
    <FormRFF
      key="features-all-filters"
      onSubmit={onSubmit}
      initialValues={INITIAL_VALUES}
    >
      {({ handleSubmit, values }) => (
        <form onSubmit={handleSubmit} autoComplete="off" className="flex flex-col flex-grow overflow-hidden text-black">
          <h2 className="flex-shrink-0 pl-8 mb-5 text-lg pr-28 font-heading">Filters</h2>

          <FieldRFF
            name="tag"
          >
            {({ input }) => (
              <div>
                <h3 className="flex-shrink-0 pl-8 mb-2 text-sm pr-28 font-heading">Filter by type</h3>
                <div className="grid grid-cols-3 gap-2 px-8">
                  {TAGS.map(({ id, label }) => {
                    const activeTypes = values.tag || [];

                    return (
                      <button
                        key={id}
                        type="button"
                        className={cx({
                          'w-full py-2 border border-gray-500 rounded-4xl text-sm': true,
                          'bg-gray-500 text-white': activeTypes.includes(id),
                        })}
                        onClick={() => {
                          const newArr = [...activeTypes];
                          const i = newArr.indexOf(id);

                          if (i > -1) {
                            newArr.splice(i, 1);
                          } else {
                            newArr.push(id);
                          }

                          input.onChange(newArr);
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </FieldRFF>

          <div className="flex justify-center flex-shrink-0 px-8 mt-20 space-x-3">
            <Button
              className="w-full"
              theme="secondary"
              size="lg"
              onClick={onClear}
            >
              Clear all
            </Button>

            <Button
              type="submit"
              className="w-full"
              theme="primary"
              size="lg"
            >
              Apply
            </Button>
          </div>
        </form>
      )}
    </FormRFF>
  );
};

export default ScenarioFeaturesAddFilters;
