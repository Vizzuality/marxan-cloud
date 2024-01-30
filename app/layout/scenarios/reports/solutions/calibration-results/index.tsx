import Image from 'next/image';
import { useRouter } from 'next/router';

import { useScenarioCalibrationResults } from 'hooks/scenarios';

import BlmChart from 'layout/project/sidebar/scenario/advanced-settings/blm-calibration/chart';

const CalibrationResultsReport = (): JSX.Element => {
  const { query } = useRouter();
  const { sid } = query as { sid: string };

  const calibrationResultsQuery = useScenarioCalibrationResults(sid);

  const chartData = [...calibrationResultsQuery.data].sort((a, b) => a.cost - b.cost);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 flex-col gap-3">
        {calibrationResultsQuery.data?.map((cr) => {
          return (
            <div key={`${cr.scenarioId}-${cr.blmValue}`} className="flex space-x-3 bg-gray-600">
              {cr.pngData && <Image src={cr.pngData} alt="Blm Image" width={150} height={150} />}
              <div className="flex flex-col space-y-2 py-2 text-sm">
                <div>
                  <p className="font-medium uppercase text-white">BLM:</p>
                  <p className="text-primary-500">{cr.blmValue}</p>
                </div>
                <div>
                  <p className="font-medium uppercase text-white">COST:</p>
                  <p className="text-primary-500">{cr.cost}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="bg-gray-600 p-4 pb-12">
        <h3 className="text-sm font-bold text-white">Calibration results</h3>
        <div className="h-64 w-full">
          {chartData?.length > 0 && (
            <BlmChart data={chartData} selected={null} onChange={() => {}} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CalibrationResultsReport;
