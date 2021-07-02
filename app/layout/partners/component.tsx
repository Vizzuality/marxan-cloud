import React from 'react';

import Wrapper from 'layout/wrapper';

export interface PartnersListProps {

}

export const PartnersList: React.FC<PartnersListProps> = () => {
  return (
    <div className="bg-white">
      <Wrapper>
        <div className="flex flex-col items-center w-full max-w-5xl py-12 mx-auto">
          <h2 className="pb-20 text-2xl leading-relaxed text-black font-heading max-w-max bg-clip-text">
            Founding partners:
          </h2>
          <div className="grid w-full grid-cols-3 gap-x-56">
            Images
          </div>
        </div>
      </Wrapper>
    </div>
  );
};

export default PartnersList;
