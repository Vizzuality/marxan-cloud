import React, { useCallback } from 'react';

import { useRouter } from 'next/router';

import { motion } from 'framer-motion';

import { useDownloadCostSurface } from 'hooks/scenarios';
import { useToasts } from 'hooks/toast';

import Button from 'components/button';
import Icon from 'components/icon';
import InfoButton from 'components/info-button';

import COST_LAND_IMG from 'images/info-buttons/img_cost_surface_marine.png';
import COST_SEA_IMG from 'images/info-buttons/img_cost_surface_terrestrial.png';

import ARROW_LEFT_SVG from 'svgs/ui/arrow-right-2.svg?sprite';

export interface ScenariosCostSurfaceProps {
  onChangeSection: (s: string) => void;
}

export const ScenariosCostSurface: React.FC<ScenariosCostSurfaceProps> = ({
  onChangeSection,
}: ScenariosCostSurfaceProps) => {
  const { addToast } = useToasts();
  const { query } = useRouter();
  const { sid } = query;

  const downloadMutation = useDownloadCostSurface({});

  const onDownload = useCallback(() => {
    downloadMutation.mutate({ id: `${sid}` }, {
      onSuccess: () => {

      },
      onError: () => {
        addToast('download-error', (
          <>
            <h2 className="font-medium">Error!</h2>
            <ul className="text-sm">
              Template not downloaded
            </ul>
          </>
        ), {
          level: 'error',
        });
      },
    });
  }, [sid, downloadMutation, addToast]);

  return (
    <motion.div
      key="cost-surface"
      className="flex flex-col items-start justify-start min-h-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="flex items-center pt-5 pb-1 space-x-3">
        <button
          type="button"
          className="flex items-center w-full space-x-2 text-left focus:outline-none"
          onClick={() => {
            onChangeSection(null);
          }}
        >
          <Icon icon={ARROW_LEFT_SVG} className="w-3 h-3 transform rotate-180 text-primary-500" />
          <h4 className="text-xs uppercase font-heading text-primary-500">Cost surface</h4>
        </button>
        <InfoButton>
          <div>
            <h4 className="font-heading text-lg mb-2.5">What is a Cost Surface?</h4>
            <div className="space-y-2">
              <p>
                In conservation planning, cost data reflects how much a
                planning unit costs to include into a
                conservation network. Typically, it reflects the
                actual price of a parcel of land.
              </p>
              <p>
                However, cost
                information is usually scarce and often the cost
                surface is used to reflect any variety of
                socioeconomic factors,
                which if minimized, might help the conservation
                plan be implemented more effectively and reduce
                conflicts with other uses.
              </p>
              <p>
                For example, here you can see 2 examples of
                cost surfaces in terrestrial and marine environments:
              </p>
              <img src={COST_SEA_IMG} alt="Cost sea" />
              <img src={COST_LAND_IMG} alt="Cost Land" />
              <p>
                The default value for cost will be the planning
                unit area but you can upload a cost
                surface. Once you upload a cost surface,
                it will be intersected with your planning unit
                grid to get one cost value per planning unit.
                This will be the cost that Marxan will use for
                each planning unit.
              </p>
            </div>

          </div>
        </InfoButton>
      </header>

      <div className="relative flex flex-col flex-grow w-full min-h-0 mt-1 overflow-hidden text-sm">
        <p className="pt-2">By default all projects have an equal area cost surface which means that planning units with the same area have the same cost</p>

        <div className="pt-5">
          <h4 className="mb-2">Download the current cost surface</h4>
          <Button
            theme="primary-alt"
            size="base"
            className="w-full"
            onClick={onDownload}
          >
            Download
          </Button>
        </div>

      </div>
    </motion.div>
  );
};

export default ScenariosCostSurface;
