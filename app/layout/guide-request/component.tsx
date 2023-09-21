import React, { useCallback } from 'react';

import { useHelp } from 'hooks/help';
import { useMe } from 'hooks/me';

import Button from 'components/button';
import Icon from 'components/icon';

import GUIDE_REQUEST_SVG from 'svgs/users/guide-request.svg?sprite';

export interface GuideRequestProps {
  onDismiss?: () => void;
}

export const GuideRequest: React.FC<GuideRequestProps> = ({ onDismiss }: GuideRequestProps) => {
  const { data: user } = useMe();

  const { onActive } = useHelp();

  const handleActiveRequestGuide = useCallback(
    (active) => {
      onActive(active);
      const { id: userId } = user;
      window.localStorage.setItem(`help-${userId}`, userId);
      onDismiss();
    },
    [onActive, onDismiss, user]
  );

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-10">
      <h2 className="text-m text-center font-heading font-medium text-gray-700">
        First things first...
      </h2>

      <Icon icon={GUIDE_REQUEST_SVG} className="w-28" />
      <div className="w-72">
        <p className="text-m text-center font-heading text-gray-700">
          Would you like to get some guidance on Marxan&apos;s workflow?
        </p>
      </div>
      <div className="flex w-72 space-x-4">
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
