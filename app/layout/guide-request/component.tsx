import React, { useCallback } from 'react';

import { useHelp } from 'hooks/help';

import Wrapper from 'layout/wrapper';

import Button from 'components/button';
import Icon from 'components/icon';

import GUIDE_REQUEST_SVG from 'svgs/users/guide-request.svg?sprite';
import { useMe } from 'hooks/me';

export interface GuideRequestProps {
  onDismiss?: () => void,
}

export const GuideRequest: React.FC<GuideRequestProps> = ({ onDismiss }:GuideRequestProps) => {
  const { user } = useMe();

  const { onActive } = useHelp();

  const handleAcceptRequestGuide = useCallback(() => {
    onActive(true);
    const { id: userId } = user;
    window.localStorage.setItem(`help-${userId}`, userId);
    onDismiss();
  }, [onActive, onDismiss, user]);

  const handleCancelRequestGuide = useCallback(() => {
    onActive(false);
    const { id: userId } = user;
    window.localStorage.setItem(`help-${userId}`, userId);
    onDismiss();
  }, [onActive, onDismiss, user]);

  return (
    <Wrapper>

      <div className="flex flex-col items-center justify-center my-32 space-y-16">

        <h2 className="text-lg font-medium text-center text-gray-600 font-heading">First things first...</h2>

        <Icon icon={GUIDE_REQUEST_SVG} className="w-40" />
        <div className="w-72">
          <p className="text-lg text-center text-gray-600 font-heading">Would you like to follow our guided Marxan workflow?</p>
        </div>
        <div className="flex space-x-4 w-72">

          <Button
            theme="tertiary"
            size="lg"
            type="submit"
            className="w-full"
            onClick={handleCancelRequestGuide}
          >
            No
          </Button>

          <Button
            theme="primary"
            size="lg"
            type="submit"
            className="w-full"
            onClick={handleAcceptRequestGuide}
          >
            Yes
          </Button>
        </div>

      </div>

    </Wrapper>
  );
};

export default GuideRequest;
