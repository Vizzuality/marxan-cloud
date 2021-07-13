import React from 'react';

import ButtonLink from 'layout/statics/button-link';

export interface StaticColumnProps {
  title: string;
  subtitle?: string;
  description?: string;
  caption: string;
  href: string,
  external?: boolean,
}

export const StaticColumn: React.FC<StaticColumnProps> = ({
  title,
  subtitle,
  description,
  caption,
  href,
  external = false,
}: StaticColumnProps) => {
  return (
    <div>
      <h2 className="h-56 pb-10 text-4xl leading-relaxed text-transparent font-heading max-w-max bg-gradient-to-r from-blue-700 via-blue-400 to-green-300 bg-clip-text">
        {title}
      </h2>
      {subtitle && (
        <h3 className="mb-6 text-lg leading-8 max-w-max font-heading">
          {subtitle}
        </h3>
      )}
      {description && (
        <p className="mb-12 text-base leading-normal text-gray-400 max-w-max">
          {description}
        </p>
      )}
      <ButtonLink caption={caption} href={href} external={external} />
    </div>
  );
};

export default StaticColumn;
