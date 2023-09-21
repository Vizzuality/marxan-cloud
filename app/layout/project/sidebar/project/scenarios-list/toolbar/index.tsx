import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { setSearch, setFilters, setSort } from 'store/slices/projects/[id]';

import { useDebouncedCallback } from 'use-debounce';

import Icon from 'components/icon';
import Modal from 'components/modal';
import Search from 'components/search';

import FILTER_SVG from 'svgs/ui/filter.svg?sprite';

import Filters from './filters';

export const ProjectScenariosToolbar = () => {
  const { search, filters, sort } = useSelector((state) => state['/projects/[id]']);
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const FILTERS_LENGTH = useMemo(() => {
    if (!filters) return 0;

    return Object.keys(filters).reduce((acc, k) => {
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
    dispatch(setSearch(value));
  }, 500);

  const onFilters = useCallback(
    (value) => {
      dispatch(setFilters(value));
    },
    [dispatch]
  );

  const onSort = useCallback(
    (value) => {
      dispatch(setSort(value));
    },
    [dispatch]
  );

  useEffect(() => {
    return function unmount() {
      dispatch(setSearch(null));
      dispatch(setFilters([]));
    };
  }, [dispatch]);

  return (
    <div className="flex items-center" id="scenarios-search">
      <Search
        size="base"
        defaultValue={search}
        placeholder="Search by feature, planning area name..."
        aria-label="Search"
        onChange={onChangeSearchDebounced}
      />

      <button
        type="button"
        className="relative flex items-center space-x-2 px-1 py-2"
        onClick={onChangeOpen}
      >
        <Icon icon={FILTER_SVG} />
        <span className="font-heading text-xs uppercase tracking-wider">
          Filters
          {!!FILTERS_LENGTH && (
            <span
              className="absolute left-0 top-0 rounded-full bg-red-600 px-1 py-0.5 text-xxs leading-none text-white"
              style={{ fontFamily: 'Arial' }}
            >
              {FILTERS_LENGTH}
            </span>
          )}
        </span>
      </button>

      <Modal
        title="All features filters"
        open={open}
        size="narrow"
        onDismiss={() => {
          setOpen(false);
        }}
      >
        <Filters filters={filters} onChangeFilters={onFilters} sort={sort} onChangeSort={onSort} />
      </Modal>
    </div>
  );
};

export default ProjectScenariosToolbar;
