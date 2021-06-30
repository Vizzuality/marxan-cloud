import React from 'react';

import cx from 'classnames';
import Wrapper from 'layout/wrapper';

export interface ExploreHeroProps {
  section: string;
  title: string;
  description: string,
}

export const ExploreHero: React.FC<ExploreHeroProps> = ({
  section,
  title,
  description,
}: ExploreHeroProps) => {
  return (
    <Wrapper>
      <div className="w-full max-w-5xl py-32 mx-auto">
        <p className="max-w-3xl text-lg font-semibold opacity-40">
          {section}
        </p>
        <h1
          className="pb-16 mt-3 font-semibold leading-tight text-left max-w-max bg-clip-text text-7xl"
        >
          {title}
        </h1>

        <div className="text-lg leading-8 text-justify max-w-max">
          {description}
        </div>
        <div className={cx({ 'h-px w-full opacity-20 bg-white mt-24': true })} />
      </div>
    </Wrapper>
  );
};

export default ExploreHero;
