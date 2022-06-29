import React, { useCallback } from 'react';

import { useHelp } from 'hooks/help';
import { useMe } from 'hooks/me';

import Button from 'components/button';
import Icon from 'components/icon';

import GUIDE_REQUEST_SVG from 'svgs/users/guide-request.svg?sprite';

export interface GuideRequestProps {
  onDismiss?: () => void,
}

export const GuideRequest: React.FC<GuideRequestProps> = ({ onDismiss }: GuideRequestProps) => {
  const { user } = useMe();

  const { onActive } = useHelp();

  const handleActiveRequestGuide = useCallback((active) => {
    onActive(active);
    const { id: userId } = user;
    window.localStorage.setItem(`help-${userId}`, userId);
    onDismiss();
  }, [onActive, onDismiss, user]);

  return (
    <div className="flex flex-col items-center justify-center py-10 space-y-6">

      <h2 className="font-medium text-center text-gray-600 text-m font-heading">First things first...</h2>

      <Icon icon={GUIDE_REQUEST_SVG} className="w-28" />
      <div className="w-72">
        <p className="text-center text-gray-600 text-m font-heading">Would you like to get some guidance on Marxan&apos;s workflow?</p>
      </div>
      <div className="flex space-x-4 w-72">

        <Button
          theme="tertiary"
          size="base"
          type="submit"
          className="w-full"
          onClick={() => handleActiveRequestGuide(false)}
        >
          No
        </Button>

        <Button
          theme="primary"
          size="base"
          type="submit"
          className="w-full"
          onClick={() => handleActiveRequestGuide(true)}
        >
          Yes
        </Button>
      </div>

    </div>
  );
};

export default GuideRequest;
