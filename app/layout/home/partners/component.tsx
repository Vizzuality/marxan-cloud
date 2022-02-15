import React from 'react';

import Wrapper from 'layout/wrapper';

import Carousel from 'components/carousel';

// import { PARTNER_LOGOS } from './constants';

export interface PartnersListProps {

}

export const PartnersList: React.FC<PartnersListProps> = () => {
  return (
    <div className="pt-24 pb-6 bg-white">

      <div className="max-w-5xl mx-auto">
        <Wrapper>
          <Carousel
            slides={[
              {
                alt: 'carousel',
                id: 1,
                src: 'https://dummyimage.com/866x565/000/fff.png&text=01',
              },
              {
                alt: 'carousel',
                id: 2,
                src: 'https://dummyimage.com/866x565/000/fff.png&text=02',
              },
              {
                alt: 'carousel',
                id: 3,
                src: 'https://dummyimage.com/866x565/000/fff.png&text=03',
              },
              {
                alt: 'carousel',
                id: 4,
                src: 'https://dummyimage.com/866x565/000/fff.png&text=04',
              },
            ]}
          />
        </Wrapper>
      </div>

    </div>
  );
};

export default PartnersList;
