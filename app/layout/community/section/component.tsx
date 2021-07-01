import React from 'react';

import Wrapper from 'layout/wrapper';

export interface CommunitySectionProps {

}

export const CommunitySection: React.FC<CommunitySectionProps> = () => {
  return (
    <Wrapper>
      <div className="grid w-full max-w-5xl grid-cols-2 py-16 mx-auto border-t border-white gap-x-36 border-opacity-20">
        COMMUNITY CONTENT
      </div>
    </Wrapper>
  );
};

export default CommunitySection;
