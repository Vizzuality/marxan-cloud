import React from 'react';

import { useRouter } from 'next/router';

import { useScenarioPU } from 'hooks/scenarios';

import PUStatusReportMap from 'layout/scenarios/reports/solutions/pu-status/map';

export const PUStatusReport = (): JSX.Element => {
  const { query } = useRouter();
  const { sid } = query as { sid: string };
  const PUDataQuery = useScenarioPU(sid);

  const PU_LEGEND_CONTAINER_CLASSES = 'flex items-center space-x-2 whitespace-nowrap';
  const PU_LEGEND_BOX_CLASSES = 'h-3.5 w-3.5 border-[3px]';
  return (
    <div className="flex space-x-6 bg-gray-100 px-10 py-3">
      <PUStatusReportMap id="report-map-cost-surface" />
      <div className="flex w-2/6 flex-col space-y-3 py-5 text-sm">
        <p className="font-semibold">Locked in/out areas</p>
        <div className={PU_LEGEND_CONTAINER_CLASSES}>
          <div className={`${PU_LEGEND_BOX_CLASSES} border-[#12EC80] bg-[#12EC80]`} />
          <p>Conservation areas </p>
        </div>
        <div className={PU_LEGEND_CONTAINER_CLASSES}>
          <div className={`${PU_LEGEND_BOX_CLASSES} border-primary-500`} />
          <p>Planning unit grid </p>
        </div>
        <div className={PU_LEGEND_CONTAINER_CLASSES}>
          <div className={`${PU_LEGEND_BOX_CLASSES} border-yellow-600`} />
          <p>Available areas </p>
          <div className="rounded-xl bg-yellow-600 px-2">
            {PUDataQuery.data?.available.length} PU
          </div>
        </div>
        <div className={PU_LEGEND_CONTAINER_CLASSES}>
          <div className={`${PU_LEGEND_BOX_CLASSES} border-green-600`} />
          <p>Included areas </p>
          <div className="rounded-xl bg-green-600 px-2">{PUDataQuery.data?.included.length} PU</div>
        </div>

        <div className={PU_LEGEND_CONTAINER_CLASSES}>
          <div className={`${PU_LEGEND_BOX_CLASSES} border-red-600`} />
          <p>Excluded areas </p>
          <div className="rounded-xl bg-red-600 px-2">{PUDataQuery.data?.excluded.length} PU</div>
        </div>
      </div>
    </div>
  );
};

export default PUStatusReport;
