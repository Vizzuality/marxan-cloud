import React, { useEffect } from 'react';

import Search from 'components/search';

export interface ScenarioFeaturesAddToolbarProps {
  search?: string;
  onSearch: (selected: string) => void;
}

export const ScenarioFeaturesAdd: React.FC<ScenarioFeaturesAddToolbarProps> = ({
  search, onSearch,
}: ScenarioFeaturesAddToolbarProps) => {
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
        placeholder="Search by scenario name..."
        aria-label="Search"
        onChange={(value) => { onSearch(value); }}
      />
    </div>
  );
};

export default ScenarioFeaturesAdd;
