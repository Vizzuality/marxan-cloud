import React from 'react';

import Link from 'next/link';

import Wrapper from 'layout/wrapper';

import Button from 'components/button';
import Icon from 'components/icon';

import GUIDE_REQUEST_SVG from 'svgs/users/guide-request.svg?sprite';

export interface GuideRequestProps {

}

export const GuideRequest: React.FC<GuideRequestProps> = () => {
  return (
    <Wrapper>

      <div className="flex flex-col items-center justify-center my-32 space-y-16">

        <h2 className="text-lg font-medium text-center text-gray-600 font-heading">First things first...</h2>

        <Icon icon={GUIDE_REQUEST_SVG} className="w-40" />
        <div className="w-72">
          <p className="text-lg text-center text-gray-600 font-heading">Would you like to follow our guided Marxan workflow?</p>
        </div>
        <div className="flex space-x-4 w-72">
          <Link href="/auth/sign-in">
            <Button theme="tertiary" size="lg" type="submit" className="w-full">
              No
            </Button>
          </Link>
          <Button theme="primary" size="lg" type="submit" className="w-full">
            Yes
          </Button>
        </div>

      </div>

    </Wrapper>
  );
};

export default GuideRequest;
