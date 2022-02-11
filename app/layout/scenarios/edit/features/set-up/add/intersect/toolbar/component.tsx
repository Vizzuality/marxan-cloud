import React, { useEffect } from 'react';

import { useDebouncedCallback } from 'use-debounce';

import Search from 'components/search';

export interface ScenarioFeaturesIntersectToolbarProps {
  search?: string;
  onSearch: (selected: string) => void;
}

export const ScenarioFeaturesIntersect: React.FC<ScenarioFeaturesIntersectToolbarProps> = ({
  search, onSearch,
}: ScenarioFeaturesIntersectToolbarProps) => {
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
    <div className="px-8">
      <Search
        theme="light"
        size="sm"
        defaultValue={search}
        placeholder="Search by feature name..."
        aria-label="Search"
        onChange={onChangeDebounced}
      />
    </div>
  );
};

export default ScenarioFeaturesIntersect;
