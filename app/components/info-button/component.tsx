import React, { ReactElement } from 'react';

import Icon from 'components/icon';
import Tooltip from 'components/tooltip';

import INFO_SVG from 'svgs/ui/info.svg?sprite';

export interface InfoButtonProps {
  children: ReactElement
}

export const InfoButton: React.FC<InfoButtonProps> = ({ children }: InfoButtonProps) => (
  <Tooltip
    arrow
    placement="right-start"
    trigger="click"
    maxWidth={350}
    content={(
      <div className="p-4 text-gray-500 bg-white rounded">
        {children || 'Add your tooltip info'}
      </div>
    )}
  >
    <button
      className="flex items-center justify-center w-5 h-5 transition bg-blue-400 bg-opacity-50 rounded-full focus:outline-none hover:bg-opacity-75 focus:bg-opacity-90"
      type="button"
    >
      <Icon icon={INFO_SVG} className="w-3 h-3 text-gray-800" />
    </button>
  </Tooltip>
);

export default InfoButton;
