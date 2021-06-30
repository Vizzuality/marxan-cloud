import React from 'react';

import Wrapper from 'layout/wrapper';

export interface StaticHeroProps {
  section: string;
  title: string;
  description: string,
}

export const StaticHero: React.FC<StaticHeroProps> = ({
  section,
  title,
  description,
}: StaticHeroProps) => {
  return (
    <Wrapper>
      <div className="w-full max-w-5xl mx-auto py-28">
        <h1 className="max-w-3xl text-lg font-semibold opacity-40">
          {section}
        </h1>
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
