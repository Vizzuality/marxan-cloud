import React from 'react';

import Icon from 'components/icon';
import Wrapper from 'layout/wrapper';

import ARROW_LEFT_SVG from 'svgs/ui/arrow-left.svg?sprite';

export interface StaticHeroProps {
  section: string;
  title: string;
  description: string;
  back?: boolean,
}

export const StaticHero: React.FC<StaticHeroProps> = ({
  section,
  title,
  description,
  back,
}: StaticHeroProps) => {
  return (
    <Wrapper>
      <div className="w-full max-w-5xl mx-auto mt-32 py-18">
        {back && (
          <a href="/community" className="flex items-center fle-row">
            <Icon icon={ARROW_LEFT_SVG} className="w-3 h-3 mr-1 text-blue-500" />
            <h1 className="max-w-3xl text-lg font-semibold text-blue-500 font-heading">
              {section}
            </h1>
          </a>
        )}
        {!back && (
          <h1 className="max-w-3xl text-lg font-semibold font-heading opacity-40">
            {section}
          </h1>
        )}
        <h2
          className="pb-16 mt-3 font-semibold leading-tight text-left max-w-max bg-clip-text text-7xl"
        >
          {title}
        </h2>

        <p className="text-lg leading-8 text-justify max-w-max font-heading">
          {description}
        </p>
      </div>
    </Wrapper>
  );
};

export default StaticHero;
