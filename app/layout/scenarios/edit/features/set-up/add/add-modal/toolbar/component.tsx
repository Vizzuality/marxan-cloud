import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';

import { useDebouncedCallback } from 'use-debounce';

import Filters from 'layout/scenarios/edit/features/set-up/add/add-modal/filters';

import Icon from 'components/icon';
import Modal from 'components/modal';
import Search from 'components/search';

import FILTER_SVG from 'svgs/ui/filter.svg?sprite';

export interface ScenarioFeaturesAddToolbarProps {
  search?: string;
  onSearch?: (selected: string) => void;

  filters?: Record<string, any>;
  onFilters?: (filters: Record<string, unknown>) => void;

  sort?: string;
  onSort?: (sort: string) => void;
}

export const ScenarioFeaturesAddToolbar: React.FC<ScenarioFeaturesAddToolbarProps> = ({
  search,
  onSearch,
  filters = {},
  onFilters,
  sort,
  onSort,
}: ScenarioFeaturesAddToolbarProps) => {
  const [open, setOpen] = useState(false);
  const FILTERS_LENGTH = useMemo(() => {
    if (!filters) return 0;

    return Object.keys(filters)
      .reduce((acc, k) => {
        if (typeof filters[k] === 'undefined') return acc;

        if (filters[k] && Array.isArray(filters[k])) {
          return acc + filters[k].length;
        }

        return acc + 1;
      }, 0);
  }, [filters]);

  const onChangeOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const onChangeSearchDebounced = useDebouncedCallback((value) => {
    onSearch(value);
  }, 500);

  useEffect(() => {
    // setSearch to null wheneverer you unmount this component
    return function unmount() {
      onSearch(null);
    };
  }, [onSearch]);

  return (
    <div className="px-8">
      <div className="flex items-center">
        <Search
          theme="light"
          size="sm"
          defaultValue={search}
          placeholder="Search by feature name..."
          aria-label="Search"
          onChange={onChangeSearchDebounced}
        />

        <button
          type="button"
          className="relative flex items-center px-1 py-2 space-x-2"
          onClick={onChangeOpen}
        >
          <Icon icon={FILTER_SVG} />
          <span className="text-xs tracking-wider uppercase font-heading">
            Filters
            {!!FILTERS_LENGTH && (
              <span className="absolute top-0 left-0 py-0.5 px-1 rounded-full bg-red-500 text-white text-xxs leading-none" style={{ fontFamily: 'Arial' }}>
                {FILTERS_LENGTH}
              </span>
            )}
          </span>
        </button>

        <Modal
          id="all-features-filters"
          title="All features filters"
          open={open}
          size="narrow"
          onDismiss={() => {
            setOpen(false);
          }}
        >
          <Filters
            filters={filters}
            onChangeFilters={onFilters}
            sort={sort}
            onChangeSort={onSort}
          />
        </Modal>
      </div>
    </div>
  );
};

export default ScenarioFeaturesAddToolbar;
