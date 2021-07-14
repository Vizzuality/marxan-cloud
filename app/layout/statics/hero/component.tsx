import React from 'react';

import Backlink from 'layout/statics/backlink';
import Wrapper from 'layout/wrapper';

export interface StaticHeroProps {
  section: string;
  title: string;
  description: string;
  backlink?: string,
}

export const StaticHero: React.FC<StaticHeroProps> = ({
  section,
  title,
  description,
  backlink,
}: StaticHeroProps) => {
  return (
    <Wrapper>
      <div className="w-full max-w-5xl mx-auto my-32">
        {backlink && (
          <Backlink href={backlink}>{section}</Backlink>
        )}
        {!backlink && (
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
