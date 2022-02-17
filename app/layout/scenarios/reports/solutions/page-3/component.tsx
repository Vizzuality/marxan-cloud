import React from 'react';

export interface ScenariosReportPage3Props {

}

export const ScenariosReportPage3: React.FC<ScenariosReportPage3Props> = () => {
  return (

    <div className="flex space-x-4">

      <section className="w-full space-y-8 text-xs">

        <div className="border-t-4 border-gray-700">
          <p className="font-semibold uppercase"> Legend:</p>
        </div>

        <div className="text-sm border-t border-gray-400">
          <p>Solutions:</p>
          <p>Selection Frequency</p>
        </div>

      </section>

    </div>
  );
};

export default ScenariosReportPage3;
