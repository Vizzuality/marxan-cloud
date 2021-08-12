import React from 'react';

import { useRouter } from 'next/router';

import { motion } from 'framer-motion';

import { useScenarioPU } from 'hooks/scenarios';

export interface ScenariosAdjustPanningUnitsShowProps {
}

export const ScenariosAdjustPanningUnitsShow: React.FC<
ScenariosAdjustPanningUnitsShowProps> = () => {
  const { query } = useRouter();
  const { sid } = query;

  const { data: PUData } = useScenarioPU(sid);
  const { included, excluded } = PUData || {};

  return (
    <motion.div
      key="gap-analysis"
      className="flex flex-col items-start justify-start min-h-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >

      <div className="relative flex flex-col flex-grow w-full min-h-0 overflow-hidden">
        <div className="absolute top-0 left-0 z-10 w-full h-3 bg-gradient-to-b from-gray-700 via-gray-700" />
        <div className="relative px-0.5 overflow-x-visible overflow-y-auto">
          <div className="py-3 space-y-6">
            <div>
              <h3 className="text-xs uppercase">
                {' '}
                Included areas
                :

              </h3>
              <div className="flex flex-wrap mt-2.5">{included.length}</div>
            </div>
            <div>
              <h3 className="text-xs uppercase">
                {' '}
                Excluded areas
                :
              </h3>
              <div className="flex flex-wrap mt-2.5">{excluded.length}</div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 z-10 w-full h-3 bg-gradient-to-t from-gray-700 via-gray-700" />
      </div>

    </motion.div>
  );
};

export default ScenariosAdjustPanningUnitsShow;
