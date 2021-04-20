import React, { useCallback, useState } from 'react';

import Button from 'components/button';

import Toolbar from 'layout/scenarios/sidebar/features/add/toolbar';
import List from 'layout/scenarios/sidebar/features/add/list';

export interface ScenariosFeaturesAddProps {
  onSuccess?: () => void;
  onDismiss?: () => void;
}

export const ScenariosFeaturesAdd: React.FC<ScenariosFeaturesAddProps> = ({
  onDismiss,
}: ScenariosFeaturesAddProps) => {
  const [search, setSearch] = useState(null);

  const onSearch = useCallback((s) => {
    setSearch(s);
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden text-black">
      <h2 className="px-8 mb-5 text-lg font-heading">Add features to your planning area</h2>
      <Toolbar search={search} onSearch={onSearch} />

      <List search={search} />

      <div className="flex justify-center px-8 space-x-3">
        <Button
          className="w-full"
          theme="secondary"
          size="lg"
          onClick={onDismiss}
        >
          Cancel
        </Button>

        <Button
          className="w-full"
          theme="primary"
          size="lg"
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default ScenariosFeaturesAdd;
