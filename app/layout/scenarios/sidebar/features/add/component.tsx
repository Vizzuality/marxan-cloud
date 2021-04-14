import React, { useCallback, useState } from 'react';

import Toolbar from 'layout/scenarios/sidebar/features/add/toolbar';
import List from 'layout/scenarios/sidebar/features/add/list';

export interface ScenariosFeaturesAddProps {
}

export const ScenariosFeaturesAdd: React.FC<ScenariosFeaturesAddProps> = () => {
  const [search, setSearch] = useState(null);

  const onSearch = useCallback((s) => {
    setSearch(s);
  }, []);

  return (
    <div className="text-black">
      <h2 className="mb-5 text-lg font-heading">Add features to your planning area</h2>
      <Toolbar search={search} onSearch={onSearch} />
      <List search={search} />
    </div>
  );
};

export default ScenariosFeaturesAdd;
