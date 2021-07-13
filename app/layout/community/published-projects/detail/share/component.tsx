import React from 'react';

import { useToasts } from 'hooks/toast';

import Icon from 'components/icon';

import FACEBOOK_FILLED_SVG from 'svgs/social/facebook-filled.svg?sprite';
import LINK_SVG from 'svgs/social/link.svg?sprite';
import TWITTER_FILLED_SVG from 'svgs/social/twitter-filled.svg?sprite';

export interface ProjectShareProps {

}

export const ProjectShare: React.FC<ProjectShareProps> = () => {
  const { addToast } = useToasts();

  const handleCopy = () => {
    const copyURL = document.getElementById('copyURLInput').baseURI;
    navigator.clipboard.writeText(copyURL).then(
      () => {
        addToast('success-copy-url', (
          <>
            <h2 className="font-medium">Success!</h2>
            <p className="text-sm">Link copied to clipboard</p>
          </>
        ), {
          level: 'success',
        });
      },
    )
      .catch(
        () => {
          addToast('error-copy-url', (
            <>
              <h2 className="font-medium">Error!</h2>
              <p className="text-sm">
                The link could not be copied.
                {' '}
                <br />
                Please, try again!
              </p>
            </>
          ), {
            level: 'error',
          });
        },
      );
  };

  return (
    <div>
      <h3 className="mb-6 text-sm font-semibold text-white">Share</h3>
      <div className="mb-5">
        <button className="flex flex-row" onClick={handleCopy} type="button">
          <Icon icon={LINK_SVG} className="w-5 h-5 mr-2.5 text-white" />
          <p className="text-sm">Copy link</p>
        </button>
        <input className="hidden" type="text" value="" id="copyURLInput" />
      </div>
      <div className="mb-5">
        <a
          className="flex flex-row"
          type="button"
          role="button"
          href={`https://twitter.com/intent/tweet?url=${typeof window !== 'undefined' && window.location.toString()}`}
          rel="noreferrer"
          target="_blank"
        >
          <Icon icon={TWITTER_FILLED_SVG} className="w-5 h-5 mr-2.5 text-white" />
          <p className="text-sm">Twitter</p>
        </a>
      </div>
      <a
        className="flex flex-row"
        type="button"
        role="button"
        href={`https://www.facebook.com/sharer/sharer.php?u=${typeof window !== 'undefined' && window.location.toString()}`}
        rel="noreferrer"
        target="_blank"
      >
        <Icon icon={FACEBOOK_FILLED_SVG} className="h-5 mr-5 text-white" />
        <p className="text-sm">Facebook</p>
      </a>
    </div>
  );
};

export default ProjectShare;
