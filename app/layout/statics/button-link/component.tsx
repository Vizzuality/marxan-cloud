import React from 'react';

import Icon from 'components/icon';

import ARROW_RIGHT_2_SVG from 'svgs/ui/arrow-right-2.svg?sprite';

export interface StaticButtonLinkProps {

}

export const StaticButtonLink: React.FC<StaticButtonLinkProps> = () => {
  return (
    <a className="flex flex-row items-center" href="/">
      <p className="mr-4 text-lg text-primary-500">Learn More</p>
      <div className="flex items-center justify-center bg-transparent border rounded-full h-7 w-7 border-primary-500">
        <Icon icon={ARROW_RIGHT_2_SVG} className="w-3 h-3 text-primary-500" />
      </div>
    </a>
  );
};

export default StaticButtonLink;
