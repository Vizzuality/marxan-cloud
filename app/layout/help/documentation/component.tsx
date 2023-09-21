import React, { useState } from 'react';

import Icon from 'components/icon';

import DOCUMENTATION_HOVER_SVG from 'svgs/ui/documentation-hover.svg?sprite';
import DOCUMENTATION_SVG from 'svgs/ui/documentation.svg?sprite';

export const DocumentationLink = () => {
  const [isHover, setIsHover] = useState(false);
  return (
    <a
      className="fixed bottom-28 right-1 z-50 p-2"
      href="https://marxansolutions.org"
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <div className="border-b border-gray-600 px-1 pb-5">
        <Icon
          className="h-6 w-6 flex-shrink-0"
          icon={isHover ? DOCUMENTATION_HOVER_SVG : DOCUMENTATION_SVG}
        />
      </div>
      {isHover && (
        <div className="z-60 absolute right-12 top-2 rounded-xl bg-white px-2 py-px text-black">
          <p className="whitespace-nowrap font-sans text-sm">Marxan&apos;s documentation</p>
        </div>
      )}
    </a>
  );
};

export default DocumentationLink;
