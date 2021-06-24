import React, { useCallback, useMemo } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';
import Button from 'components/button';
import Checkbox from 'components/forms/checkbox';
import Label from 'components/forms/label';
import Radio from 'components/forms/radio';

export interface ScenarioFeaturesAddFiltersProps {
  filters?: Record<string, any>;
  onChangeFilters: (filters: Record<string, any>) => void;
  sort?: string;
  onChangeSort: (sort: string) => void;
  onDismiss?: () => void;
}

const TAGS = [
  { id: 'species', label: 'species' },
  { id: 'bioregional', label: 'bioregional' },
];

const SORT = [
  { id: 'alias', label: 'Alphabetical' },
  { id: '-alias', label: '-Alphabetical' },
  { id: 'featureClassName', label: 'Classname' },
  { id: '-featureClassName', label: '-Classname' },
];

export const ScenarioFeaturesAddFilters: React.FC<ScenarioFeaturesAddFiltersProps> = ({
  filters = {},
  onChangeFilters,
  sort,
  onChangeSort,
  onDismiss,
}: ScenarioFeaturesAddFiltersProps) => {
  const INITIAL_VALUES = useMemo(() => {
    return {
      ...filters,
      sort: sort || SORT[0].id,
    };
  }, [filters, sort]);

  // Callbacks
  const onSubmit = useCallback((values) => {
    const { sort: valuesSort, ...valuesFilters } = values;
    onChangeFilters(valuesFilters);
    onChangeSort(valuesSort);
    if (onDismiss) onDismiss();
  }, [onChangeFilters, onChangeSort, onDismiss]);

  const onClear = useCallback(() => {
    onChangeFilters({});
    onChangeSort(null);
    if (onDismiss) onDismiss();
  }, [onChangeFilters, onChangeSort, onDismiss]);

  return (
    <FormRFF
      key="features-all-filters"
      onSubmit={onSubmit}
      initialValues={INITIAL_VALUES}
    >
      {({ handleSubmit }) => (
        <form onSubmit={handleSubmit} autoComplete="off" className="flex flex-col flex-grow overflow-hidden text-black">
          <h2 className="pl-8 mb-5 text-lg pr-28 font-heading">Filters</h2>

          <div className="flex flex-col px-8 space-y-5">
            <div>
              <h3 className="flex-shrink-0 mb-2 text-sm pr-28 font-heading">Filter by type</h3>
              <div className="flex flex-col space-y-2">
                {TAGS.map(({ id, label }) => {
                  return (
                    <FieldRFF
                      key={id}
                      name="tag"
                      type="checkbox"
                      value={id}
                    >
                      {(fprops) => (
                        <div className="flex space-x-2">
                          <Checkbox theme="light" id={`tag-${id}`} {...fprops.input} />
                          <Label theme="light" id={`tag-${id}`} className="ml-2">{label}</Label>
                        </div>
                      )}
                    </FieldRFF>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="flex-shrink-0 mb-2 text-sm pr-28 font-heading">Order by</h3>
              <div className="flex flex-col space-y-2">
                {SORT.map(({ id, label }) => {
                  return (
                    <FieldRFF
                      key={id}
                      name="sort"
                      type="radio"
                      value={id}
                    >
                      {(fprops) => (
                        <div className="flex space-x-2">
                          <Radio theme="light" id={`tag-${id}`} {...fprops.input} />
                          <Label theme="light" id={`tag-${id}`} className="ml-2">{label}</Label>
                        </div>
                      )}
                    </FieldRFF>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-center flex-shrink-0 px-8 mt-10 space-x-3">
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
