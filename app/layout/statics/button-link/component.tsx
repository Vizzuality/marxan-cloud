import React from 'react';

import Link from 'next/link';

import Icon from 'components/icon';
import { cn } from 'utils/cn';

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
        className={cn({
          'mr-4 text-lg underline': true,
          'text-gray-700': theme === 'dark',
          'text-white': theme === 'light',
        })}
      >
        {caption}
      </p>
      <div
        className={cn({
          'flex h-7 w-7 items-center justify-center rounded-full border bg-transparent': true,
          'border-gray-700': theme === 'dark',
          'border-white': theme === 'light',
        })}
      >
        <Icon
          icon={ARROW_RIGHT_2_SVG}
          className={cn({
            'h-3 w-3': true,
            'text-gray-700': theme === 'dark',
            'text-white': theme === 'light',
          })}
        />
      </div>
    </>
  );

  return (
    <>
      {external && (
        <a
          className="flex cursor-pointer flex-row items-center transition-opacity hover:opacity-60"
          href={href}
          rel="noopener noreferrer"
          target="_blank"
        >
          {children}
        </a>
      )}
      {!external && (
        <Link href={href} legacyBehavior>
          <div className="flex cursor-pointer flex-row items-center transition-opacity hover:opacity-60">
            {children}
          </div>
        </Link>
      )}
    </>
  );
};

export default StaticButtonLink;
