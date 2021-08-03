import React from 'react';

import Link from 'next/link';

import classnames from 'classnames';

import Icon from 'components/icon';

import ARROW_RIGHT_2_SVG from 'svgs/ui/arrow-right-2.svg?sprite';

export interface StaticButtonLinkProps {
  caption: string;
  href: string;
  external?: boolean;
  theme?: 'dark' | 'light';
}

export const StaticButtonLink: React.FC<StaticButtonLinkProps> = ({
  caption,
  href,
  external = false,
  theme = 'dark',
}: StaticButtonLinkProps) => {
  const children = (
    <>
      <p
        className={classnames({
          'mr-4 text-lg underline': true,
          'text-gray-600': theme === 'dark',
          'text-white': theme === 'light',
        })}
      >
        {caption}
      </p>
      <div
        className={classnames({
          'flex items-center justify-center bg-transparent border rounded-full h-7 w-7': true,
          'border-gray-600': theme === 'dark',
          'border-white': theme === 'light',
        })}
      >
        <Icon
          icon={ARROW_RIGHT_2_SVG}
          className={classnames({
            'w-3 h-3': true,
            'text-gray-600': theme === 'dark',
            'text-white': theme === 'light',
          })}
        />
      </div>
    </>
  );

  return (
    <>
      {external && (
        <a className="flex flex-row items-center cursor-pointer transition-opacity hover:opacity-60" href={href} rel="noopener noreferrer" target="_blank">
          {children}
        </a>
      )}
      {!external && (
        <Link href={href}>
          <div className="flex flex-row items-center cursor-pointer transition-opacity hover:opacity-60">
            {children}
          </div>
        </Link>
      )}
    </>
  );
};

export default StaticButtonLink;
