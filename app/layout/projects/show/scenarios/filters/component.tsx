import React, { useCallback, useMemo } from 'react';

import { Form as FormRFF, Field as FieldRFF } from 'react-final-form';

import Button from 'components/button';
import Checkbox from 'components/forms/checkbox';
import Label from 'components/forms/label';
import Radio from 'components/forms/radio';

export interface ProjectScenariosFiltersProps {
  filters?: Record<string, any>;
  onChangeFilters: (filters: Record<string, any>) => void;
  sort?: string;
  onChangeSort: (sort: string) => void;
  onDismiss?: () => void;
}

const STATUS = [
  { id: 'created', label: 'Created' },
  { id: 'running', label: 'Running' },
  { id: 'done', label: 'Completed' },
  { id: 'failure', label: 'Failed' },
];

const SORT = [
  { id: '-lastModifiedAt', label: 'Most recent' },
  { id: 'lastModifiedAt', label: 'First created' },
  { id: 'name', label: 'Name' },
  { id: '-name', label: '-Name' },
];

export const ProjectScenariosFilters: React.FC<ProjectScenariosFiltersProps> = ({
  filters = {},
  onChangeFilters,
  sort,
  onChangeSort,
  onDismiss,
}: ProjectScenariosFiltersProps) => {
  const INITIAL_VALUES = useMemo(() => {
    return {
      ...filters,
      sort: sort || SORT[0].id,
    };
  }, [filters, sort]);

  // Callbacks
  const onSubmit = useCallback(
    (values) => {
      const { sort: valuesSort, ...valuesFilters } = values;
      onChangeFilters(valuesFilters);
      onChangeSort(valuesSort);
      if (onDismiss) onDismiss();
    },
    [onChangeFilters, onChangeSort, onDismiss]
  );

  const onClear = useCallback(() => {
    onChangeFilters({});
    onChangeSort(null);
    if (onDismiss) onDismiss();
  }, [onChangeFilters, onChangeSort, onDismiss]);

  return (
    <FormRFF key="features-all-filters" onSubmit={onSubmit} initialValues={INITIAL_VALUES}>
      {({ handleSubmit }) => (
        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="flex flex-grow flex-col overflow-hidden text-black"
        >
          <h2 className="mb-5 pl-8 pr-28 font-heading text-lg">Filters</h2>

          <div className="flex flex-col space-y-5 px-8">
            <div>
              <h3 className="mb-2 flex-shrink-0 pr-28 font-heading text-sm">Filter by type</h3>
              <div className="flex flex-col space-y-2">
                {STATUS.map(({ id, label }) => {
                  return (
                    <FieldRFF key={id} name="status" type="checkbox" value={id}>
                      {(fprops) => (
                        <div className="flex space-x-2">
                          <Checkbox theme="light" id={`status-${id}`} {...fprops.input} />
                          <Label theme="light" id={`status-${id}`} className="ml-2">
                            {label}
                          </Label>
                        </div>
                      )}
                    </FieldRFF>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="mb-2 flex-shrink-0 pr-28 font-heading text-sm">Order by</h3>
              <div className="flex flex-col space-y-2">
                {SORT.map(({ id, label }) => {
                  return (
                    <FieldRFF key={id} name="sort" type="radio" value={id}>
                      {(fprops) => (
                        <div className="flex space-x-2">
                          <Radio theme="light" id={`sort-${id}`} {...fprops.input} />
                          <Label theme="light" id={`sort-${id}`} className="ml-2">
                            {label}
                          </Label>
                        </div>
                      )}
                    </FieldRFF>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-shrink-0 justify-center space-x-3 px-8">
            <Button className="w-full" theme="secondary" size="lg" onClick={onClear}>
              Clear all
            </Button>

            <Button type="submit" className="w-full" theme="primary" size="lg">
              Apply
            </Button>
          </div>
        </form>
      )}
    </FormRFF>
  );
};

export default ProjectScenariosFilters;
