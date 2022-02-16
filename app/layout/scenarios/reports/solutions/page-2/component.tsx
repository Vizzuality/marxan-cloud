import React from 'react';

import ScenarioReportsMap from 'layout/scenarios/reports/map';

export interface ScenariosReportPage2Props {

}

export const ScenariosReportPage2: React.FC<ScenariosReportPage2Props> = () => {
  return (

    <div className="flex space-x-4">

      <section className="w-1/3 space-y-8 text-xs">

        <div className="border-t-4 border-gray-700">
          <p className="font-semibold uppercase"> Legend:</p>
        </div>

        <div className="text-sm border-t border-gray-400">
          <p> Solutions:</p>
          <p> Selection Frequency</p>
        </div>

      </section>

      <section className="w-2/3" style={{ height: '552px' }}>
        <ScenarioReportsMap />
      </section>

    </div>
  );
};

export default ScenariosReportPage2;
