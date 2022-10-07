import React, { useState } from 'react';

import Icon from 'components/icon';

import DOCUMENTATION_HOVER_SVG from 'svgs/ui/documentation-hover.svg?sprite';
import DOCUMENTATION_SVG from 'svgs/ui/documentation.svg?sprite';

export const DocumentationLink = () => {
  const [isHover, setIsHover] = useState(false);
  return (

    <a
      className="fixed z-50 p-2 right-1 bottom-28"
      href="https://marxansolutions.org"
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <div className="px-1 pb-5 border-b border-gray-500">
        <Icon className="flex-shrink-0 w-6 h-6" icon={isHover ? DOCUMENTATION_HOVER_SVG : DOCUMENTATION_SVG} />
      </div>
      {isHover && (

        <div className="absolute px-2 py-px text-black bg-white top-2 right-12 z-60 rounded-xl">
          <p className="font-sans text-sm whitespace-nowrap">
            Marxan&apos;s documentation
          </p>
        </div>
      )}
    </a>

  );
};

export default DocumentationLink;
