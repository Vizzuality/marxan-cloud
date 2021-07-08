import React from 'react';

import { useToasts } from 'hooks/toast';

import Icon from 'components/icon';

import FACEBOOK_FILLED_SVG from 'svgs/social/facebook-filled.svg?sprite';
import TWITTER_FILLED_SVG from 'svgs/social/twitter-filled.svg?sprite';

export interface ProjectShareProps {

}

export const ProjectShare: React.FC<ProjectShareProps> = () => {
  const { addToast } = useToasts();

  const handleCopy = () => {
    const copyURL = document.getElementById('copyURLInput').baseURI;
    navigator.clipboard.writeText(copyURL).then(
      () => {
        addToast('success-upload-shapefile', (
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
          addToast('error-upload-shapefile', (
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
        <button onClick={handleCopy} type="button">
          Copy link
        </button>
        <input className="hidden" type="text" value="" id="copyURLInput" />
      </div>
      <div className="mb-5">
        <a
          className="flex flex-row"
          type="button"
          role="button"
          href={`https://twitter.com/intent/tweet?url=${window.location.toString()}`}
          rel="noreferrer"
          target="_blank"
        >
          <Icon icon={TWITTER_FILLED_SVG} className="w-5 h-5 mr-2.5 text-white" />
          Twitter
        </a>
      </div>
      <a
        className="flex flex-row"
        type="button"
        role="button"
        href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.toString()}`}
        rel="noreferrer"
        target="_blank"
      >
        <Icon icon={FACEBOOK_FILLED_SVG} className="w-5 h-5 mr-2.5 text-white" />
        Facebook
      </a>
    </div>
  );
};

export default ProjectShare;
