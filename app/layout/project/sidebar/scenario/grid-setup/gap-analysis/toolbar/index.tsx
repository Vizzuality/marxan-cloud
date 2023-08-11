import React, { useEffect } from 'react';

import { useDebouncedCallback } from 'use-debounce';

import Search from 'components/search';

export const ScenarioGapAnalysis = ({
  search,
  onSearch,
}: {
  search?: string;
  onSearch: (selected: string) => void;
}) => {
  const onChangeDebounced = useDebouncedCallback((value: string) => {
    onSearch(value);
  }, 500);

  useEffect(() => {
    // setSearch to null wheneverer you unmount this component
    return function unmount() {
      onSearch(null);
    };
  }, [onSearch]);

  return (
    <div>
      <Search
        theme="dark"
        size="sm"
        defaultValue={search}
        placeholder="Search by feature name..."
        aria-label="Search"
        onChange={onChangeDebounced}
      />
    </div>
  );
};

export default ScenarioGapAnalysis;
