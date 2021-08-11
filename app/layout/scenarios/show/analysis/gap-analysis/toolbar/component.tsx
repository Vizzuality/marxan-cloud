import React, { useEffect } from 'react';

import { useDebouncedCallback } from 'use-debounce';

import Search from 'components/search';

export interface ScenarioGapAnalysisToolbarProps {
  search?: string;
  onSearch: (selected: string) => void;
}

export const ScenarioGapAnalysis: React.FC<ScenarioGapAnalysisToolbarProps> = ({
  search, onSearch,
}: ScenarioGapAnalysisToolbarProps) => {
  const onChangeDebounced = useDebouncedCallback((value) => {
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
