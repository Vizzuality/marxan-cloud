import React from 'react';

import Backlink from 'layout/statics/backlink';
import Wrapper from 'layout/wrapper';

export interface StaticHeroProps {
  section?: string;
  title: string;
  description: string;
  backlink?: string;
  theme: 'dark' | 'light';
}

export const StaticHero: React.FC<StaticHeroProps> = ({
  section,
  title,
  description,
  backlink,
  theme = 'dark',
}: StaticHeroProps) => {
  return (
    <div className={theme === 'light' ? 'bg-primary-50 text-black' : 'bg-black'}>
      <Wrapper>
        <div className="w-full max-w-5xl mx-auto my-32">
          {backlink && (
            <Backlink href={backlink}>{section}</Backlink>
          )}
          <h2
            className="pb-16 mt-3 font-semibold leading-tight text-left max-w-max bg-clip-text text-7xl"
          >
            {title}
          </h2>

          <p className="text-lg leading-8 max-w-max" style={{ columnCount: 2 }}>
            {description}
          </p>
        </div>
      </Wrapper>
    </div>
  );
};

export default StaticHero;
