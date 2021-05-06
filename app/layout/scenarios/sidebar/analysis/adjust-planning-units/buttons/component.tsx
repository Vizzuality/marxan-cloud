import React, { useState } from 'react';
import cx from 'classnames';

import Icon from 'components/icon';

import SELECT_PLANNING_UNITS_SVG from 'svgs/ui/planning-units.svg?sprite';
import DRAW_SHAPE_SVG from 'svgs/ui/draw.svg?sprite';
import UPLOAD_SVG from 'svgs/ui/upload.svg?sprite';
import ARROW_UP_SVG from 'svgs/ui/arrow-up.svg?sprite';

import Clicking from './clicking';
import Drawing from './drawing';
import Uploading from './uploading';

const BUTTONS = [
  {
    id: 'clicking',
    name: 'Select planning units',
    icon: SELECT_PLANNING_UNITS_SVG,
    Component: Clicking,
  },
  {
    id: 'drawing',
    name: 'Draw shape on map',
    icon: DRAW_SHAPE_SVG,
    Component: Drawing,
  },
  {
    id: 'uploading',
    name: 'Upload shapefile',
    icon: UPLOAD_SVG,
    Component: Uploading,
  },
];

export interface AnalysisAdjustButtonsProps {
  type: string;
}

export const AnalysisAdjustButtons: React.FC<AnalysisAdjustButtonsProps> = ({
  type,
}: AnalysisAdjustButtonsProps) => {
  const [selected, setSelected] = useState(null);

  return (
    <div key={type} className="flex flex-col w-full mt-5 space-y-2">
      {BUTTONS.map((b) => {
        const active = selected === b.id;
        return (
          <div
            key={b.id}
            role="presentation"
            className={cx({
              'text-sm py-2.5 focus:outline-none relative transition rounded-3xl px-10 cursor-pointer': true,
              'bg-gray-600 text-gray-200 opacity-50': !active,
              'bg-gray-600 text-white': active,
            })}
            onClick={() => setSelected(b.id)}
          >
            <header className="relative w-full">
              <div
                className={cx({
                  'text-center': !active,
                  'text-left': active,
                })}
              >
                {b.name}
              </div>

              {!active && (
                <Icon
                  className="absolute right-0 w-5 h-5 transform -translate-y-1/2 top-1/2"
                  icon={b.icon}
                />
              )}

              {active && (
                <button
                  type="button"
                  className="absolute right-0 flex items-center justify-center h-5 pl-5 pr-1 transform -translate-y-1/2 border-l border-gray-300 top-1/2 focus:outline-none"
                  onClickCapture={() => setSelected(null)}
                >
                  <Icon
                    className="w-3 h-3 text-primary-500"
                    icon={ARROW_UP_SVG}
                  />
                </button>
              )}
            </header>

            {active && (
              <div className="pt-2">
                <b.Component />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AnalysisAdjustButtons;
