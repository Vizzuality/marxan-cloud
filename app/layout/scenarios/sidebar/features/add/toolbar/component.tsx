import React, { useEffect } from 'react';

import Search from 'components/search';
import { useDebouncedCallback } from 'use-debounce';

export interface ScenarioFeaturesAddToolbarProps {
  search?: string;
  onSearch: (selected: string) => void;
}

export const ScenarioFeaturesAdd: React.FC<ScenarioFeaturesAddToolbarProps> = ({
  search, onSearch,
}: ScenarioFeaturesAddToolbarProps) => {
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

export default ScenarioFeaturesAdd;
