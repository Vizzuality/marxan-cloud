import React, { useEffect } from 'react';

import Search from 'components/search';

export interface ScenarioFeaturesIntersectToolbarProps {
  search?: string;
  onSearch: (selected: string) => void;
}

export const ScenarioFeaturesIntersectToolbar: React.FC<ScenarioFeaturesIntersectToolbarProps> = ({
  search, onSearch,
}: ScenarioFeaturesIntersectToolbarProps) => {
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
        onChange={(value) => { onSearch(value); }}
      />
    </div>
  );
};

export default ScenarioFeaturesIntersectToolbar;
