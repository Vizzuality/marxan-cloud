import React from 'react';

import ButtonLink from 'layout/statics/button-link';

export interface StaticColumnProps {
  title: string;
  subtitle?: string;
  description?: string;
  caption?: string;
  image?: string;
  href?: string;
  external?: boolean;
}

export const StaticColumn: React.FC<StaticColumnProps> = ({
  title,
  subtitle,
  description,
  caption,
  image,
  href,
  external = false,
}: StaticColumnProps) => {
  return (
    <div>
      <h2 className="h-56 max-w-max pb-10 font-heading text-4xl leading-relaxed">{title}</h2>
      {subtitle && <h3 className="mb-6 max-w-max font-heading text-lg leading-8">{subtitle}</h3>}
      {description && (
        <p className="mb-12 max-w-max text-base leading-normal text-white">{description}</p>
      )}
      {image && (
        <div>
          <img
            src={image}
            alt=""
            style={{
              width: '403px',
              height: 'auto',
              filter: 'drop-shadow(0px 8px 15px rgba(0, 0, 0, .35))',
            }}
          />
        </div>
      )}
      {href && <ButtonLink caption={caption} href={href} external={external} theme="light" />}
    </div>
  );
};

export default StaticColumn;
