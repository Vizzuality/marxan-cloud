import React from 'react';

import { useRouter } from 'next/router';

import { useToasts } from 'hooks/toast';

import Icon from 'components/icon';

import FACEBOOK_FILLED_SVG from 'svgs/social/facebook-filled.svg?sprite';
import LINK_SVG from 'svgs/social/link.svg?sprite';
import TWITTER_FILLED_SVG from 'svgs/social/twitter-filled.svg?sprite';

export interface ProjectShareProps {}

export const ProjectShare: React.FC<ProjectShareProps> = () => {
  const { addToast } = useToasts();
  const { asPath } = useRouter();

  const handleCopy = () => {
    const copyURL = `${window.location.origin}${asPath}`;

    navigator.clipboard
      .writeText(copyURL)
      .then(() => {
        addToast(
          'success-copy-url',
          <>
            <h2 className="font-medium">Success!</h2>
            <p className="text-sm">Link copied to clipboard</p>
          </>,
          {
            level: 'success',
          }
        );
      })
      .catch(() => {
        addToast(
          'error-copy-url',
          <>
            <h2 className="font-medium">Error!</h2>
            <p className="text-sm">
              The link could not be copied. <br />
              Please, try again!
            </p>
          </>,
          {
            level: 'error',
          }
        );
      });
  };

  return (
    <div>
      <h3 className="mb-6 text-sm font-semibold">Share</h3>

      <div className="space-y-5">
        <button type="button" className="flex flex-row hover:underline" onClick={handleCopy}>
          <Icon icon={LINK_SVG} className="mr-2.5 h-5 w-5 text-black" />
          <p className="text-sm">Copy link</p>
        </button>

        <a
          className="flex flex-row hover:underline"
          type="button"
          role="button"
          href={`https://twitter.com/intent/tweet?url=${
            process.env.NEXT_PUBLIC_VERCEL_URL || process.env.NEXT_PUBLIC_URL
          }${asPath}`}
          rel="noreferrer"
          target="_blank"
        >
          <Icon icon={TWITTER_FILLED_SVG} className="mr-2.5 h-5 w-5" />
          <p className="text-sm">Twitter</p>
        </a>

        <a
          className="flex flex-row hover:underline"
          type="button"
          role="button"
          href={`https://www.facebook.com/sharer/sharer.php?u=${
            process.env.NEXT_PUBLIC_VERCEL_URL || process.env.NEXT_PUBLIC_URL
          }${asPath}`}
          rel="noreferrer"
          target="_blank"
        >
          <Icon icon={FACEBOOK_FILLED_SVG} className="mr-5 h-5" />
          <p className="text-sm">Facebook</p>
        </a>
      </div>
    </div>
  );
};

export default ProjectShare;
