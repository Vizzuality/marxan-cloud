import React from 'react';

import ButtonLink from 'layout/statics/button-link';

export interface StaticColumnProps {
  title: string;
  subtitle?: string;
  description?: string;
  caption: string;
  href: string,
}

export const StaticColumn: React.FC<StaticColumnProps> = ({
  title,
  subtitle,
  description,
  caption,
  href,
}: StaticColumnProps) => {
  return (
    <div>
      <h2 className="pb-10 text-4xl leading-relaxed text-transparent font-heading max-w-max bg-gradient-to-r from-blue-600 to-green-400 bg-clip-text">
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
      <ButtonLink caption={caption} href={href} />
    </div>
  );
};

export default StaticColumn;
