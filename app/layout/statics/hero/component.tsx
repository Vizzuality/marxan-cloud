import React from 'react';

import Backlink from 'layout/statics/backlink';
import Wrapper from 'layout/wrapper';
import { cn } from 'utils/cn';

export interface StaticHeroProps {
  section?: string;
  title: string;
  description: string;
  backlink?: string;
  theme?: 'dark' | 'light';
}

export const StaticHero: React.FC<StaticHeroProps> = ({
  section,
  title,
  description,
  backlink,
  theme = 'dark',
}: StaticHeroProps) => {
  return (
    <div
      className={cn({
        'bg-primary-50 text-black': theme === 'light',
        'bg-black': theme === 'dark',
      })}
    >
      <Wrapper>
        <div className="mx-auto my-32 w-full max-w-5xl">
          {backlink && <Backlink href={backlink}>{section}</Backlink>}
          <h2 className="mt-3 max-w-max bg-clip-text pb-16 text-left text-7xl font-semibold leading-tight">
            {title}
          </h2>

          <p className="max-w-max text-lg leading-8">{description}</p>
        </div>
      </Wrapper>
    </div>
  );
};

export default StaticHero;
