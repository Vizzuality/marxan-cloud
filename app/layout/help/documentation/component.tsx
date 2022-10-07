import React from 'react';

import Icon from 'components/icon';

import DOCUMENTATION_SVG from 'svgs/ui/documentation.svg?sprite';

export const DocumentationLink = () => {
  return (

    <div
      className="fixed z-50 p-2 right-2.5 bottom-32"
    >
      <Icon className="flex-shrink-0 w-6 h-6 fill-red-500" icon={DOCUMENTATION_SVG} />
    </div>
  );
};

export default DocumentationLink;
