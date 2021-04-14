import React from 'react';

import List from 'layout/scenarios/sidebar/features/add/list';

export interface ScenariosFeaturesAddProps {
}

export const ScenariosFeaturesAdd: React.FC<ScenariosFeaturesAddProps> = () => {
  return (
    <div className="text-black">
      <h2 className="text-lg font-heading">Add features to your planning area</h2>

      <List />
    </div>
  );
};

export default ScenariosFeaturesAdd;
