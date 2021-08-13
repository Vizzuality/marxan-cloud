import React from 'react';

import { useRouter } from 'next/router';

import { motion } from 'framer-motion';

import { useScenarioPU } from 'hooks/scenarios';

import Icon from 'components/icon';
import InfoButton from 'components/info-button';

import LOCK_IN_OUT_IMG from 'images/info-buttons/img_lockin_lock_out.png';

import HEXAGON_SVG from 'svgs/map/hexagon.svg?sprite';
import ARROW_LEFT_SVG from 'svgs/ui/arrow-right-2.svg?sprite';

export const COLORS = {
  include: '#0F0',
  exclude: '#F00',
};

export interface ScenariosAdjustPanningUnitsShowProps {
  onChangeSection: (s: string) => void;
}

export const ScenariosAdjustPanningUnitsShow: React.FC<
ScenariosAdjustPanningUnitsShowProps> = ({ onChangeSection }:
ScenariosAdjustPanningUnitsShowProps) => {
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

      <header className="flex items-center pt-5 pb-1 space-x-3">
        <button
          type="button"
          className="flex items-center w-full space-x-2 text-left focus:outline-none"
          onClick={() => {
            onChangeSection(null);
          }}
        >
          <Icon icon={ARROW_LEFT_SVG} className="w-3 h-3 transform rotate-180 text-primary-500" />
          <h4 className="text-xs uppercase font-heading">Adjust planning units</h4>
        </button>
        <InfoButton>
          <div>
            <h4 className="font-heading text-lg mb-2.5">Locked-in and locked-out planning units</h4>
            <div className="space-y-2">
              <p>
                You can force Marxan to include or exclude some planning units from your analysis.
              </p>
              <p>
                Manually including or excluding individual planning units
                is useful when a real-world issue affects where new
                protected areas can be designated. For example, if
                you know that a particular planning unit contains a restricted
                military area and cannot be designated, then you could
                manually exclude that planning unit from the project.
              </p>
              <p>
                You can see the example below where a city is
                marked as locked-out and a protected area is
                marked as locked-in:
              </p>
              <img src={LOCK_IN_OUT_IMG} alt="Feature-Range" />
              <p>
                The areas selected to be included will be
                {' '}
                <b>locked in </b>
                to your conservation plan and will appear in all of the solutions.
              </p>
              <p>
                The areas selected to be excluded will be
                {' '}
                <b>locked out </b>
                of your conservation plan and will never appear in the solutions
              </p>
            </div>

          </div>
        </InfoButton>
      </header>

      <div className="relative flex flex-col flex-grow w-full min-h-0 overflow-hidden">
        <div className="absolute top-0 left-0 z-10 w-full h-3 bg-gradient-to-b from-gray-700 via-gray-700" />
        <div className="relative px-0.5 overflow-x-visible overflow-y-auto">
          <div className="py-3 space-y-6">
            <div>
              <div className="flex space-x-2">
                <Icon icon={HEXAGON_SVG} className="w-3.5 h-3.5 mt-0.5 stroke-current stroke-2 fill-none" style={{ color: COLORS.include }} />
                <h3 className="text-sm">
                  {' '}
                  Included areas (Lock-in)
                  :

                </h3>
              </div>
              <div className="flex flex-wrap mt-2.5 text-gray-300">{`${included.length} PU`}</div>
            </div>
            <div>
              <div className="flex space-x-2">
                <Icon icon={HEXAGON_SVG} className="w-3.5 h-3.5 mt-0.5 stroke-current stroke-2 fill-none" style={{ color: COLORS.exclude }} />
                <h3 className="text-sm">
                  {' '}
                  Excluded areas (Lock-out)
                  :
                </h3>
              </div>
              <div className="flex flex-wrap mt-2.5 text-gray-300">{`${excluded.length} PU`}</div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 z-10 w-full h-3 bg-gradient-to-t from-gray-700 via-gray-700" />
      </div>

    </motion.div>
  );
};

export default ScenariosAdjustPanningUnitsShow;
